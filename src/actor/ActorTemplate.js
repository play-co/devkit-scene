import effects;

// TODO: this is a fairly bad solution to a problem, find a better solution (two different inheritance trees)
// TODO: jsdoc doesnt understand this witchcraft, make it do so

exports = function(inherits) {
  return Class(inherits, function() {

    var suprPrototype = inherits.prototype;

    /**
     * @class ActorTemplate
     * @param {object}         [opts]
     * @param {boolean|object} [opts.followTouches] - Follow touches on the screen, or follow one or both axis (if argument type is Object)
     * @param {boolean}        [opts.followTouches.x]
     * @param {boolean}        [opts.followTouches.y]
     * @param {boolean}        [opts.followTouches.instant=false] - causes the actor to be at the touch position instantly, without smoothing
     * @param {number}         [opts.followTouches.xMultipier=0.1] - When not instant, this is used for velocity smoothing
     * @param {number}         [opts.followTouches.yMultipier=0.1] - When not instant, this is used for velocity smoothing
     * @param {cameraUpdateFunction|cameraUpdateFunction[]} [opts.cameraFunction]
     * @param {number}         [opts.health]
     * @param {boolean|object} [opts.faceForward] - Causes the actor to always face in the direction it is heading (determined by velocity)
     * @param {number}         [opts.faceForward.offset] - An offset for the actor to use while facing forward
     */
    this.init = function(opts) {
      suprPrototype.init.call(this, opts);
    }

    /**
     * Reset the actor using the given config
     * @method ActorTemplate#reset
     * @param  {object}  [config]
     * @param  {boolean} [config.followTouches]
     * @param  {function|function[]} [config.cameraFunction]
     * @param  {number}  [config.health]
     * @param  {boolean} [config.faceForward]
     * @param  {number}  [config.scale]
     * @param  {number}  [config.frameRate]
     * @param  {number}  [config.rotation]
     * @param  {boolean} [config.flipX]
     * @param  {boolean} [config.flipY]
     * @param  {number}  [config.zIndex]
     */
    this.reset = function(config) {
      suprPrototype.reset.call(this, config);

      effects.clear(this);
      this.lastFollowTarget = null;
      this.destroyHandlers = [];
      this.tickHandlers = [];

      this.dtExisted = 0;

      // Follow touches
      this.updateFollowTouches(config.followTouches);

      // Camera functions
      this.cameraFunction = config.cameraFunction;
      if (this.cameraFunction && !Array.isArray(this.cameraFunction)) {
        this.cameraFunction = [this.cameraFunction];
      }

      // Health
      this.health = config.health || 1;

      this.faceForward = config.faceForward || false;

      this.unscaledHitBounds = this.model.hitBounds;
      this.scale = config.scale !== undefined ? config.scale : 1;
      this.view.setFramerate(config.frameRate !== undefined ? config.frameRate : 30);

      this.rotation = config.rotation || 0;
      this.flipX = config.flipX || false;
      this.flipY = config.flipY || false;
      this.zIndex = config.zIndex || 0;
      this.opacity = config.opacity !== undefined ? config.opacity : 1;
    }

    /**
     * Utility function, multiply all numbers in source by scale into target
     * Note: Both arrays or objects should have the same length or key set
     * @method ActorTemplate#applyScaledBounds
     * @param  {number[]|Object.<?, number>} sourceBounds
     * @param  {number[]|Object.<?, number>} targetBounds
     * @param  {number}   scale
     */
    this.applyScaledBounds = function(sourceBounds, targetBounds, scale) {
      for (var i in sourceBounds) {
        targetBounds[i] = sourceBounds[i] * scale;
      }
    };

    /**
     * Update whether or not this actor should follow touches on screen
     * @method ActorTemplate#updateFollowTouches
     * @param  {boolean|{boolean: x, boolean: y}} opts
     */
    this.updateFollowTouches = function(opts) {
      // Follow touches?
      if (opts && typeof opts === 'boolean') {
        opts = { x: true, y: true };
      }

      this.followTouches = opts;

      if (this.followTouches) {
        this.followTouches.xMultiplier = this.followTouches.xMultiplier !== undefined
            ? this.followTouches.xMultiplier : 0.1;
        this.followTouches.yMultiplier = this.followTouches.yMultiplier !== undefined
            ? this.followTouches.yMultiplier : 0.1;
      }
    };

    /**
     * Cached reference to make faster direct calls.  See parent classes update function.
     * @method ActorTemplate#updateEntity
     */
    this.updateEntity = suprPrototype.update;

    /**
     * @method ActorTemplate#update
     * @param  {number} dt Time in milliseconds
     */
    this.update = function(dt) {
      if (!this.active) {
        console.warn('Will not update inactive Actor.');
        return;
      }

      this.dtExisted += dt;

      this._followTouch(dt);
      this.updateEntity(dt);

      if (this.faceForward) {
        this.rotateAt(this.x + this.vx, this.y + this.vy, this.faceForward.offset);
      }

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
          this.view.update(dt);
        }
      }
    };

    /**
     * @method ActorTemplate#_followTouch
     * @param  {number} dt Time in milliseconds
     * @private
     */
    this._followTouch = function(dt) {
      // Move toward the current touch or mouse down, if followTouches
      if (!this.followTouches) { return; }
      // We are dividing by dt in here, cannot have dt of 0
      if (dt === 0) { return; }
      var currentTouch = scene.screen.defaultTouch;

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
     * @method ActorTemplate#hurt
     * @param  {number} amount
     */
    this.hurt = function(amount) {
      this.health -= amount;

      if (this.health <= 0) {
        this.destroy();
      }
    };

    /**
     * Add an amount of health
     * @method ActorTemplate#heal
     * @param  {number} amount
     */
    this.heal = function(amount) {
      this.health += amount;
    };

    /**
     * Fire {@link callback} when this instance is completely inside target
     * @method ActorTemplate#onEntered
     * @param  {ActorTemplate|Shape|Collidable} target
     * @param  {function} callback
     * @return {number} collisionCheckID
     */
    this.onEntered = function(target, callback) {
      this._registerCollision(target, callback, 'ON_ENTERED');
    };

    /**
     * Fire {@link callback} when this instance is completely outside of target
     * @method ActorTemplate#onExited
     * @param  {Actor|Shape|Collidable} target
     * @param  {function} callback
     * @return {number} collisionCheckID
     */
    this.onExited = function(target, callback) {
      this._registerCollision(target, callback, 'ON_EXITED');
    };

    /**
     * Register a new collision with scene, and return
     * @method ActorTemplate#_registerCollision
     * @param  {object}   target
     * @param  {function} callback
     * @param  {string}   type
     * @return {number} collisionCheckID
     * @see CollisionManager.registerCollision
     * @private
     */
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
     * Set vx and vy to aim for the specified point, with the specified speed.
     * @method ActorTemplate#headToward
     * @param  {number} x
     * @param  {number} y
     * @param  {number} speed
     */
    this.headToward = function(x, y, speed) {
      var targetAngle = Math.atan2(y - this.y, x - this.x);
      this.vx = speed * Math.cos(targetAngle);
      this.vy = speed * Math.sin(targetAngle);
    };

    /**
     * Rotate the actor to point at the specified x and y coordinates (with an optional rotation offset)
     * @method ActorTemplate#rotateAt
     * @param  {number} x
     * @param  {number} y
     * @param  {number} [offset]
     */
    this.rotateAt = function(x, y, offset) {
      var targetAngle = Math.atan2(y - this.y, x - this.x) + Math.PI / 2;
      this.view.style.r = targetAngle + (offset || 0);
    };

    /**
     * Register a new tick handler
     * @method ActorTemplate#onTick
     * @param  {onTickCallback} callback
     */
    this.onTick = function(callback) {
      this.tickHandlers.push(callback);
    };

    /**
     * This function destroys the Actor, as in, removes it from the scene
     * @param {boolean} [runDestroyHandlers]
     */
    this.destroy = function(runDestroyHandlers) {
      runDestroyHandlers = runDestroyHandlers !== undefined ? runDestroyHandlers : true;

      if (runDestroyHandlers) {
        for (var i = 0; i < this.destroyHandlers.length; i++) {
          this.destroyHandlers[i](this);
        }
      }
      suprPrototype.destroy.call(this);

      // Run various cleanups
      scene.collisions.removeCollisionsContaining(this);
      scene.clearAnimations(this);
      effects.commit(this);
    };

    /**
     * Stops all input to the actor
     * @method ActorTemplate#stopInput
     * @return {Actor} self
     */
    this.stopInput = function() {
      scene.screen.removeOnDown(this._inputCb);
      return this;
    };

    /**
     * @method ActorTemplate#onTouch
     * @param {function} cb Function for an onTouch event
     * @return {Actor} self
     */
    this.onTouch = function(cb) {
      this._inputCb = scene.screen.onDown(function(pt) {
        if (this.model.shape.contains(pt.x, pt.y)) {
          cb();
        }
      }.bind(this));
      return this;
    };

    /**
     * @method ActorTemplate#play
     * @param {string}   [animation]  The animation to start playing (or use the default animation)
     * @param {function} [onComplete] Run when the animation is complete
     */
    this.play = function(animation, onComplete) {
      animation = animation || this.view._opts.defaultAnimation;

      this.view.startAnimation(animation, {
        loop: false,
        callback: function () {
          this.view.pause();
          if (onComplete) { onComplete(); }
        }.bind(this)
      });
      this.view.resume();

      return this;
    };

    /**
     * Start looping the specified animation
     * @method ActorTemplate#loop
     * @param {string} [animation] The animation to start looping (or use the default animation)
     * @return {Actor} self
     */
    this.loop = function(animation) {
      animation = animation || this.view._opts.defaultAnimation;
      this.view.startAnimation(animation, { loop: true });
      this.view.resume();
      return this;
    };

    /**
     * Actually pauses the current animation
     * @method ActorTemplate#stop
     * @return {Actor} self
     */
    this.stop = function() {
      this.view.pause();
      return this;
    };

    /**
     * The current absolute velocity
     * @method ActorTemplate#getSpeed
     * @return {number}
     */
    this.getSpeed = function() {
      return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    };

    /**
     * Register a new destroy handler, will be called after destroy has been called
     * Note: This is not guaranteed, as destroy can potentially be invoked with an option to ignore destroy handlers
     * @method ActorTemplate#onDestroy
     * @param {function} callback
     */
    this.onDestroy = function(callback) {
      this.destroyHandlers.push(callback);
    };

    /**
     * @method ActorTemplate#_addStyleProperty
     * @param  {string} styleName A valid style property
     * @param  {string} [newName] A different name to use for the local property
     * @private
     */
    this._addStyleProperty = function(styleName, newName) {
      newName = newName || styleName;
      Object.defineProperty(this, newName, {
        get: function() { return this.view.style[styleName]; },
        set: function(value) { this.view.style[styleName] = value; }
      });
    };

    /** Shortcut to this.view.style.opacity
        @var {number} ActorTemplate#opacity */
    this._addStyleProperty('opacity');
    /** Shortcut to this.view.style.fliipX
        @var {number} ActorTemplate#fliipX */
    this._addStyleProperty('flipX');
    /** Shortcut to this.view.style.flipY
        @var {number} ActorTemplate#flipY */
    this._addStyleProperty('flipY');
    /** Shortcut to this.view.style.r
        @var {number} ActorTemplate#rotation */
    this._addStyleProperty('r', 'rotation');
    /** Shortcut to this.view.style.zIndex
        @var {number} ActorTemplate#zIndex */
    this._addStyleProperty('zIndex');

    /**
     * The current sprite animation, or an empty string if this is not a sprite
     * @var {number} ActorTemplate#currentAnimation
     * @readonly
     */
    Object.defineProperty(this, 'currentAnimation', {
      get: function() { return this.view.isSprite ? this.view._currentAnimationName : ''; }
    });

    /**
     * Shortcut to this.view.style.scale. Updates hit bounds on set.
     * @var {number} ActorTemplate#scale
     */
    Object.defineProperty(this, 'scale', {
      get: function() { return this.view.style.scale },
      set: function(value) {
        this.view.style.scale = value;
        this.applyScaledBounds(this.unscaledHitBounds, this.model.hitBounds, value);
      }
    });

    /** Shortcut to this.view.clipRect
        @var {number} ActorTemplate#clipRect */
    Object.defineProperty(this, 'clipRect', {
      get: function() { return this.view.clipRect; },
      set: function(value) { this.view.clipRect = value; }
    });

    /** Shortcut to this.view.showHitBounds
        @method ActorTemplate#showHitBounds */
    this.showHitBounds = function() {
      this.view.showHitBounds();
    };

  });
};
