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
    supr.init.call(this, opts);
    this.reset(opts);
  }

  this.reset = function(config) {

    supr.reset.call(this, config);

    this.lastFollowTarget = null;
    this.destroyHandlers = [];
    this.tickHandlers = [];
    effects.commit(this);

    // Follow touches
    this.updateFollowTouches(config.followTouches);

    // Camera functions
    this.cameraFunction = config.cameraFunction;
    if (this.cameraFunction && !Array.isArray(this.cameraFunction)) {
      this.cameraFunction = [this.cameraFunction];
    }

    // Health
    this.health = config.health || 1;

    this.destroyed = false;
    config.autoSize = true;

    this.unscaledHitBounds = this.model.hitBounds;
    this.scale = config.scale !== undefined ? config.scale : 1;
    this.view.setFramerate(config.frameRate !== undefined ? config.frameRate : 30);
  }

  this.applyScaledBounds = function(sourceBounds, targetBounds, scale) {
    for (var i in sourceBounds) {
      targetBounds[i] = sourceBounds[i] * scale;
    }
  };

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

    this.followTouch();
    this.updateEntity(dt);

    // onTick handlers
    for (var i = 0; i < this.tickHandlers.length; i++) {
      this.tickHandlers[i].call(this, dt);
    }

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

  this.followTouch = function() {
    // Move toward the current touch or mouse down, if followTouches
    if (!this.followTouches) { return; }
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
  this.destroy = function(runDestroyHandlers) {
    runDestroyHandlers = runDestroyHandlers !== undefined ? runDestroyHandlers : true;
    scene.collisions.removeCollisionsContaining(this);
    if (runDestroyHandlers) {
      for (var i = 0; i < this.destroyHandlers.length; i++) {
        this.destroyHandlers[i](this);
      }
    }
    if (this.view.hasAnimations) { this.view.stopAnimation(); }
    this.destroyed = true;
    supr.destroy.call(this);
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
  this.play = function(animation, onComplete) {
    animation = animation || this.view._opts.defaultAnimation;

    this.view.startAnimation(animation, {
      loop: false,
      callback: function () {
        if (onComplete) { onComplete(); }
        this.view.pause();
      }.bind(this)
    });
    this.view.resume();

    return this;
  }

  /**
   * loop(animation)
   */
  this.loop = function(animation) {
    animation = animation || this.view._opts.defaultAnimation;
    this.view.startAnimation(animation, { loop: true });
    this.view.resume();
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

  Object.defineProperty(this, "opacity", {
    get: function() { return this.view.style.opacity; },
    set: function(value) { this.view.style.opacity = value; }
  });

  Object.defineProperty(this, "scale", {
    get: function() { return this.view.style.scale },
    set: function(value) {
      this.view.style.scale = value;
      this.applyScaledBounds(this.unscaledHitBounds, this.model.hitBounds, value);
    }
  });

  this.showHitBounds = function() {
    this.view.showHitBounds();
    // this.view.hitBoundsView.style.offsetX = -this.view.style.offsetX * this.view.style.scale;
    // this.view.hitBoundsView.style.offsetY = -this.view.style.offsetY * this.view.style.scale;
    // this.view.hitBoundsView.style.scale = 1 / this.view.style.scale;
  };

});
