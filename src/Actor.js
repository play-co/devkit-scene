import entities.Entity as Entity;
import effects;

import .ActorView;

/**
  * This is the basic entity for all things in a scene game.  If it moves, it's and actor.
  * @class Actor
  * @extends Entity
  * @arg {Object} [opts]
  *
  * @arg {boolean|Object} [opts.followTouches] - Follow touches on the screen, or follow one or both axis (if argument type is Object)
  * @arg {boolean} [opts.followTouches.x]
  * @arg {boolean} [opts.followTouches.y]
  * @arg {boolean} [opts.followTouches.instant=false] - causes the actor to be at the touch position instantly, without smoothing
  * @arg {number} [opts.followTouches.xMultipier=0.1] - When not instant, this is used for velocity smoothing
  * @arg {number} [opts.followTouches.yMultipier=0.1] - When not instant, this is used for velocity smoothing
  *
  * @arg {cameraUpdateFunction|cameraUpdateFunction[]} [opts.cameraFunction]
  *
  * @arg {number} [opts.health]
  */
exports = Class(Entity, function() {

  var supr = Entity.prototype;

  this.init = function(opts) {
    this.viewClass = ActorView;

    this.opts = opts;

    supr.init.call(this, opts);

    this.updateFollowTouches(opts.followTouches);

    this.lastFollowTarget = null;
    this.cameraFunction = null;
    this.health = 0;

    this.destroyed = false;
    this.has_reset = false;
    this.config = opts;

    // Center the entity by default
    this.x = opts.x || scene.screen.width / 2;
    this.y = opts.y || scene.screen.height / 2;

    this.destroyHandlers = [];
    this.tickHandlers = [];
  }

  this.reset = function(x, y, config) {
    effects.commit(this);

    this.updateFollowTouches(config.followTouches);

    this.x = x !== undefined ? x : this.x;
    this.y = y !== undefined ? y : this.y;
    this.config = config || this.config;

    this.destroyHandlers = [];
    this.tickHandlers = [];

    // Follow touches
    this.followTouches = config.followTouches;
    this.lastFollowTarget = null;

    // Camera functions
    this.cameraFunction = this.config.cameraFunction;
    if (this.cameraFunction && !Array.isArray(this.cameraFunction)) {
      this.cameraFunction = [this.cameraFunction];
    }

    // Health
    this.health = this.config.health || 1;

    this.has_reset = true;
    this.destroyed = false;
    this.config.autoSize = true;
    this.config.ax = config.ax || 0;
    this.config.ay = config.ay || 0;
    this.config.vx = config.vx || 0;
    this.config.vy = config.vy || 0;

    this.view.resetAllAnimations(this.config);

    if (this.view.hasAnimations) {

      // FIXME This is a hack to get around devkit-entities not knowing how to autosize SpriteViews
      //       but knowing how to autosize ImageViews if the config's image field is set.
      this.config.image = this.view.getFrame(this.config.defaultAnimation, 0)._originalURL;
      // The purpose of this is to start animations that could not be started before calling the
      // resetAllAnimations function. These variables are set in play() and loop()
      this.initial_function && this.initial_function.apply(this, this.initial_arguments);
    } else {
      this.config.image = this.config.url;
    }

    supr.reset.call(this, this.x, this.y, this.config);

    // default center anchor
    this.view.style.anchorX = config.anchorX || this.view.style.width / 2;
    this.view.style.anchorY = config.anchorY || this.view.style.height / 2;
  }

  this.updateFollowTouches = function(opts) {
    // Follow touches?
    this.followTouches = opts;

    if (this.followTouches) {
      this.followTouches.xMultiplier = this.followTouches.xMultiplier !== undefined
          ? this.followTouches.xMultiplier : 0.1;
      this.followTouches.yMultiplier = this.followTouches.yMultiplier !== undefined
          ? this.followTouches.yMultiplier : 0.1;
    }
  };

  // Cached reference to make faster direct calls
  this.updateEntity = Entity.prototype.update;

  this.update = function(dt) {
    if (this.destroyed) {
      console.warn('Will not update destroyed Actor.');
      return;
    }

    // Move toward the current touch or mouse down, if followTouches
    if (this.followTouches) {
      var currentTouch = scene.screen.getTouch();

      // Make sure we dont just cruise on forever in one direction
      var targetTouch = (!currentTouch && this.lastFollowTarget)
        ? this.lastFollowTarget : currentTouch;
      this.lastFollowTarget = targetTouch;

      if (targetTouch) {
        // Translate to world coords
        targetTouch = scene.camera.screenToWorld(targetTouch);

        if (this.followTouches.x) {
          var dx = targetTouch.x - this.x;
          this.vx = (this.followTouches.instant
            ? dx
            : dx * this.followTouches.xMultiplier) / dt;
        }
        if (this.followTouches.y) {
          var dy = targetTouch.y - this.y;
          this.vy = (this.followTouches.instant
            ? dy
            : dy * this.followTouches.yMultiplier) / dt;
        }
      }
    }

    // onTick handlers
    for (var i = 0; i < this.tickHandlers.length; i++) {
      this.tickHandlers[i].call(this, dt);
    }

    this.updateEntity(dt);

    // camera functions
    if (this.cameraFunction) {
      var shouldUpdateView = false;
      for (var i = 0; i < this.cameraFunction.length; i++) {
        var flag = this.cameraFunction[i].call(scene.camera, this);
        shouldUpdateView = shouldUpdateView || flag;
      }

      if (shouldUpdateView) {
        this.updateView(dt);
      }
    }
  };

  /**
    * Remove an amount of health, and destroy if dead.
    * @func Actor#hurt
    * @arg {number} amount
    */
  this.hurt = function(amount) {
    this.health -= amount;

    if (this.health <= 0) {
      this.destroy();
    }
  };

  /**
    * Add an amount of health
    * @func Actor#heal
    * @arg {number} amount
    */
  this.heal = function(amount) {
    this.health += amount;
  };

  /**
    * Fire {@link callback} when this {@link Actor} is completely inside {@link target}
    * @func Actor#onEntered
    * @arg {Actor|Shape|Collidable} target
    * @arg {function} callback
    * @returns {number} collisionCheckID
    */
  this.onEntered = function(target, callback) {
    this._registerCollision(target, callback, 'ON_ENTERED');
  };

  /**
    * Fire {@link callback} when this {@link Actor} is completely outside of {@link target}
    * @func Actor#onExited
    * @arg {Actor|Shape|Collidable} target
    * @arg {function} callback
    * @returns {number} collisionCheckID
    */
  this.onExited = function(target, callback) {
    this._registerCollision(target, callback, 'ON_EXITED');
  };

  this._registerCollision = function(target, callback, type) {
    return scene.collisions.registerCollision(
      new scene.collision.CollisionChecker({
        a: this,
        b: target,
        callback: callback,
        collisionType: type
      })
    );
  }

  /**
    * Set {@link Actor#vx} and {@link Actor#vy} to aim for the specified point, with the specified speed.
    * @func Actor#headToward
    * @arg {number} x
    * @arg {number} y
    * @arg {number} speed
    */
  this.headToward = function(x, y, speed) {
    var targetAngle = Math.atan2(y - this.y, x - this.x);
    this.vx = speed * Math.cos(targetAngle);
    this.vy = speed * Math.sin(targetAngle);
  };

  /**
    * Register a new tick handler
    * @func Actor#onTick
    * @arg {onTickCallback} callback
    */
  this.onTick = function(callback) {
    this.tickHandlers.push(callback);
  };

  /**
   * This function destroys the Actor, as in, removes it from the scene
   */
  this.destroy = function() {
    scene.collisions.removeCollisionsContaining(this);
    for (var i = 0; i < this.destroyHandlers.length; i++) {
      this.destroyHandlers[i].call(this);
    }
    if (this.view.hasAnimations) { this.view.stopAnimation(); }
    this.destroyed = true;
    if (this.pool) {
      this.release();
    } else {
      this.view.removeFromSuperview();
    }
  }

  /**
   * This function stops all input to the actor
   * @func Actor#stopInput
   * @returns {Actor} self
   */
  this.stopInput = function() {
    delete this.view.onInputStart;
    return this;
  }

  /**
   * onTouch
   * ~ callback function for an onTouch event
   */
  this.onTouch = function(cb) {
    this.view.onInputStart = cb;
    return this;
  }

  /**
   * play(animation)
   */
  this.play = function(animation) {
    animation = animation || this.view._opts.defaultAnimation;
    if (this.has_reset) {
      this.view.startAnimation(animation, {
        loop: false,
        callback: function () {
          this.view.pause();
        }.bind(this)
      });
      this.view.resume();
    } else {
      this.initial_function = this.play;
      this.initial_arguments = Array.prototype.slice.call(arguments);
    }

    return this;
  }

  /**
   * loop(animation)
   */
  this.loop = function(animation) {
    animation = animation || this.view._opts.defaultAnimation;
    if (this.has_reset) {
      this.view.startAnimation(animation, { loop: true });
      this.view.resume();
    } else {
      this.initial_function = this.loop;
      this.initial_arguments = Array.prototype.slice.call(arguments);
    }

    return this;
  };

  /**
    * Register a new destroy handler, will be called after {@link Actor#destroy} has been called.
    * @func Actor#onDestroy
    * @arg {function} callback
    */
  this.onDestroy = function(callback) {
    this.destroyHandlers.push(callback);
  };

  Object.defineProperty(this, "currentAnimation", {
    get: function() { return this.view.hasAnimations ? this.view._currentAnimationName : ""; }
  });

});
