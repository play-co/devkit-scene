import effects;
import entities.Entity as Entity;

/**
 * This class is the basic building block for games in scene. An actor is a visible, interactive game element.
 * @class Actor
 * @extends {@link Entity}
 */
exports = Class(Entity, function () {
  var suprPrototype = Entity.prototype;

  /**
   * Reset the actor using the given opts; this is called automatically by {@link scene#addActor} / {@link group#addActor}
   * @method Actor#reset
   * @param {object} opts
   * @param {number} [opts.x] - The horizontal coordinate of the actor
   * @param {number} [opts.y] - The vertical coordinate of the actor
   * @param {number} [opts.offsetX=0] - The horizontal offset of the actor
   * @param {number} [opts.offsetY=0] - The vertical offset of the actor
   * @param {number} [opts.zIndex] - The sort-order for this actor's view; higher numbers render in front of lower numbers
   * @param {number} [opts.width] - The width of the actor's view and hit bounds
   * @param {number} [opts.height] - The height of the actor's view and hit bounds
   * @param {boolean} [opts.flipX=false] - Flip the actor's view horizontally
   * @param {boolean} [opts.flipY=false] - Flip the actor's view vertically
   * @param {number} [opts.opacity=1] - The transparency of an actor's view, from 0 (invisible) to 1 (opaque)
   * @param {number} [opts.vx=0] - The initial horizontal velocity of the actor
   * @param {number} [opts.vy=0] - The initial vertical velocity of the actor
   * @param {number} [opts.ax=0] - The initial horizontal acceleration of the actor
   * @param {number} [opts.ay=0] - The initial vertical acceleration of the actor
   * @param {number} [opts.rotation=0] - The rotation of the actors view around the anchor point
   * @param {object} [opts.hitOpts] - A set of properties to apply only to the hit bounds of an actor (and not its view); the opts object itself is used if no hitOpts is specified
   * @param {number} [opts.hitOpts.offsetX=0] - The horizontal offset of the actor's hit bounds; overrides opts.offsetX
   * @param {number} [opts.hitOpts.offsetY=0] - The vertical offset of the actor's hit bounds; overrides opts.offsetY
   * @param {number} [opts.hitOpts.width] - The width of the actor's hit bounds; overrides opts.width
   * @param {number} [opts.hitOpts.height] - The height of the actor's hit bounds; overrides opts.height
   * @param {number} [opts.hitOpts.radius] - Makes the actor's hit bounds a circle and defines its radius
   * @param {object} [opts.viewOpts] - A set of properties to apply only to the view of an actor (and not its hit bounds); accepts any devkit View style property; the opts object itself is used if no viewOpts is specified
   * @param {number} [opts.viewOpts.offsetX=0] - The horizontal offset of the actor's view; overrides opts.offsetX
   * @param {number} [opts.viewOpts.offsetY=0] - The vertical offset of the actor's view; overrides opts.offsetY
   * @param {number} [opts.viewOpts.anchorX=0] - The horizontal anchor of the actor's view; used as a pivot point for rotation and scaling
   * @param {number} [opts.viewOpts.anchorY=0] - The vertical anchor of the actor's view; used as a pivot point for rotation and scaling
   * @param {number} [opts.viewOpts.width] - The width of the actor's view; overrides opts.width
   * @param {number} [opts.viewOpts.height] - The height of the actor's view; overrides opts.height
   * @param {number} [opts.viewOpts.scale=1] - Multiplier to modify the actor's view dimensions around the anchor point
   * @param {number} [opts.viewOpts.scaleX=1] - Multiplier to modify the actor's view width around anchorX
   * @param {number} [opts.viewOpts.scaleY=1] - Multiplier to modify the actor's view height around anchorY
   * @param {string} [opts.viewOpts.compositeOperation=''] - A JavaScript canvas context globalCompositeOperation; try 'lighter' for a bright blend effect
   * @param {string} [opts.viewOpts.image] - Resource path to a static image to display the actor; i.e. 'resources/images/ninja.png'
   * @param {string} [opts.viewOpts.url] - Resource path to the subject of a sprite animation; i.e. 'resources/images/ninja' where an example sprite frame is 'resources/images/ninja_run_0001.png'
   * @param {string} [opts.viewOpts.defaultAnimation] - The default sprite animation action; i.e. 'run' where an example sprite frame is 'resources/images/ninja_run_0001.png'
   * @param {boolean} [opts.viewOpts.loop] - Whether or not to loop the defaultAnimation of a sprite
   * @param {boolean} [opts.viewOpts.autoStart] - Whether or not to start the defaultAnimation immediately
   * @param {number} [opts.viewOpts.frameRate=24] - The frames-per-second of the sprite animation
   * @param {boolean|object} [opts.followTouches] - Whether the actor should follow touches on the screen; if type object, describes how it should follow touches
   * @param {boolean} [opts.followTouches.x=false] - Follow touches horizontally
   * @param {boolean} [opts.followTouches.y=false] - Follow touches vertically
   * @param {boolean} [opts.followTouches.instant=false] - The actor moves to the touch position instantly, without smoothing
   * @param {number} [opts.followTouches.xMultipier=0.1] - When not instant, this is used for velocity smoothing
   * @param {number} [opts.followTouches.yMultipier=0.1] - When not instant, this is used for velocity smoothing
   * @param {cameraUpdateFunction|cameraUpdateFunction[]} [opts.cameraFunction]
   * @param {number} [opts.health=1] - Initial health of the actor
   * @param {boolean|object} [opts.faceForward] - Causes the actor to always face in the direction it is heading (determined by velocity)
   * @param {number} [opts.faceForward.offset] - An offset for the actor to use while facing forward
   */
  this.reset = function (opts) {
    // shortcuts for viewOpts if undefined
    this.scale = opts.scale !== void 0 ? opts.scale : 1;
    this.rotation = opts.rotation || 0;
    this.flipX = opts.flipX || false;
    this.flipY = opts.flipY || false;
    this.zIndex = opts.zIndex || 0;
    this.opacity = opts.opacity !== void 0 ? opts.opacity : 1;
    this.view.setFramerate(opts.frameRate !== void 0 ? opts.frameRate : 24);

    // call Entity's reset function
    suprPrototype.reset.call(this, opts);

    effects.clear(this);

    this.dtExisted = 0;
    this.lastFollowTarget = null;
    this.destroyHandlers = [];
    this.tickHandlers = [];
    this.health = opts.health || 1;
    this.faceForward = opts.faceForward || false;
    this.updateFollowTouches(opts.followTouches);
    this.cameraFunction = opts.cameraFunction;
    if (this.cameraFunction && !Array.isArray(this.cameraFunction)) {
      this.cameraFunction = [this.cameraFunction];
    }
  };

  /**
   * Utility function, multiply all numbers in source by scale into target
   * Note: Both arrays or objects should have the same length or key set
   * @method Actor#applyScaledBounds
   * @param {number[]|Object.<?, number>} sourceBounds
   * @param {number[]|Object.<?, number>} targetBounds
   * @param {number}   scale
   */
  this.applyScaledBounds = function (sourceBounds, targetBounds, scale) {
    for (var i in sourceBounds) {
      targetBounds[i] = sourceBounds[i] * scale;
    }
  };

  /**
   * Update whether or not this actor should follow touches on screen
   * @method Actor#updateFollowTouches
   * @param {boolean|{boolean: x, boolean: y}} opts
   */
  this.updateFollowTouches = function (opts) {
    // Follow touches?
    if (opts && typeof opts === 'boolean') {
      opts = { x: true, y: true };
    }

    this.followTouches = opts;

    if (this.followTouches) {
      this.followTouches.xMultiplier = this.followTouches.xMultiplier !== void 0
          ? this.followTouches.xMultiplier : 0.1;
      this.followTouches.yMultiplier = this.followTouches.yMultiplier !== void 0
          ? this.followTouches.yMultiplier : 0.1;
    }
  };

  /**
   * Cached reference to make faster direct calls.  See parent classes update function.
   * @method Actor#updateEntity
   */
  this.updateEntity = suprPrototype.update;

  /**
   * @method Actor#update
   * @param {number} dt Time in milliseconds
   */
  this.update = function (dt) {
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
   * @method Actor#_followTouch
   * @param {number} dt Time in milliseconds
   * @private
   */
  this._followTouch = function (dt) {
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
   * @method Actor#hurt
   * @param {number} amount
   */
  this.hurt = function (amount) {
    this.health -= amount;

    if (this.health <= 0) {
      this.destroy();
    }
  };

  /**
   * Add an amount of health
   * @method Actor#heal
   * @param {number} amount
   */
  this.heal = function (amount) {
    this.health += amount;
  };

  /**
   * Fire {@link callback} when this instance is completely inside target
   * @method Actor#onEntered
   * @param {Actor|Shape|Collidable} target
   * @param {function} callback
   * @return {number} collisionCheckID
   */
  this.onEntered = function (target, callback) {
    this._registerCollision(target, callback, 'ON_ENTERED');
  };

  /**
   * Fire {@link callback} when this instance is completely outside of target
   * @method Actor#onExited
   * @param {Actor|Shape|Collidable} target
   * @param {function} callback
   * @return {number} collisionCheckID
   */
  this.onExited = function (target, callback) {
    this._registerCollision(target, callback, 'ON_EXITED');
  };

  /**
   * Register a new collision with scene, and return
   * @method Actor#_registerCollision
   * @param {object}   target
   * @param {function} callback
   * @param {string}   type
   * @return {number} collisionCheckID
   * @see CollisionManager.registerCollision
   * @private
   */
  this._registerCollision = function (target, callback, type) {
    return scene.collisions.registerCollision(
      new scene.collision.CollisionChecker({
        a: this,
        b: target,
        callback: callback,
        collisionType: type
      })
    );
  };

  /**
   * Set vx and vy to aim for the specified point, with the specified speed.
   * @method Actor#headToward
   * @param {number} x
   * @param {number} y
   * @param {number} speed
   */
  this.headToward = function (x, y, speed) {
    var targetAngle = Math.atan2(y - this.y, x - this.x);
    this.vx = speed * Math.cos(targetAngle);
    this.vy = speed * Math.sin(targetAngle);
  };

  /**
   * Rotate the actor to point at the specified x and y coordinates (with an optional rotation offset)
   * @method Actor#rotateAt
   * @param {number} x
   * @param {number} y
   * @param {number} [offset]
   */
  this.rotateAt = function (x, y, offset) {
    var targetAngle = Math.atan2(y - this.y, x - this.x) + Math.PI / 2;
    this.view.style.r = targetAngle + (offset || 0);
  };

  /**
   * Register a new tick handler
   * @method Actor#onTick
   * @param {onTickCallback} callback
   */
  this.onTick = function (callback) {
    this.tickHandlers.push(callback);
  };

  /**
   * This function destroys the Actor, as in, removes it from the scene
   * @param {boolean} [runDestroyHandlers]
   */
  this.destroy = function (runDestroyHandlers) {
    runDestroyHandlers = runDestroyHandlers !== void 0 ? runDestroyHandlers : true;

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
   * @method Actor#stopInput
   * @return {Actor} self
   */
  this.stopInput = function () {
    scene.screen.removeOnDown(this._inputCb);
    return this;
  };

  /**
   * @method Actor#onTouch
   * @param {function} cb Function for an onTouch event
   * @return {Actor} self
   */
  this.onTouch = function (cb) {
    this._inputCb = scene.screen.onDown(function (pt) {
      if (this.model.shape.contains(pt.x, pt.y)) {
        cb();
      }
    }.bind(this));
    return this;
  };

  /**
   * @method Actor#play
   * @param {string}   [animation]  The animation to start playing (or use the default animation)
   * @param {function} [onComplete] Run when the animation is complete
   */
  this.play = function (animation, onComplete) {
    animation = animation || this.view._opts.defaultAnimation;

    this.view.startAnimation(animation, {
      loop: false,
      callback: function () {
        this.view.pause();
        var currentAnimation = this.view._animations[animation];
        if (currentAnimation) { this.view.setImage(currentAnimation.frames[currentAnimation.frames.length - 1]); }
        if (onComplete) { onComplete(); }
      }.bind(this)
    });
    this.view.resume();

    return this;
  };

  /**
   * Start looping the specified animation
   * @method Actor#loop
   * @param {string} [animation] The animation to start looping (or use the default animation)
   * @return {Actor} self
   */
  this.loop = function (animation) {
    animation = animation || this.view._opts.defaultAnimation;
    this.view.startAnimation(animation, { loop: true });
    this.view.resume();
    return this;
  };

  /**
   * Actually pauses the current animation
   * @method Actor#stop
   * @return {Actor} self
   */
  this.stop = function () {
    this.view.pause();
    return this;
  };

  /**
   * The current absolute velocity
   * @method Actor#getSpeed
   * @return {number}
   */
  this.getSpeed = function () {
    return Math.sqrt(this.vx * this.vx + this.vy * this.vy);
  };

  /**
   * Register a new destroy handler, will be called after destroy has been called
   * Note: This is not guaranteed, as destroy can potentially be invoked with an option to ignore destroy handlers
   * @method Actor#onDestroy
   * @param {function} callback
   */
  this.onDestroy = function (callback) {
    this.destroyHandlers.push(callback);
  };

  /**
   * @method Actor#_addStyleProperty
   * @param {string} styleName A valid style property
   * @param {string} [newName] A different name to use for the local property
   * @private
   */
  this._addStyleProperty = function (styleName, newName) {
    newName = newName || styleName;
    Object.defineProperty(this, newName, {
      get: function () { return this.view.style[styleName]; },
      set: function (value) { this.view.style[styleName] = value; }
    });
  };

  /** Shortcut to this.view.style.opacity
      @var {number} Actor#opacity */
  this._addStyleProperty('opacity');
  /** Shortcut to this.view.style.fliipX
      @var {number} Actor#fliipX */
  this._addStyleProperty('flipX');
  /** Shortcut to this.view.style.flipY
      @var {number} Actor#flipY */
  this._addStyleProperty('flipY');
  /** Shortcut to this.view.style.r
      @var {number} Actor#rotation */
  this._addStyleProperty('r', 'rotation');
  /** Shortcut to this.view.style.zIndex
      @var {number} Actor#zIndex */
  this._addStyleProperty('zIndex');

  /**
   * The current sprite animation, or an empty string if this is not a sprite
   * @var {number} Actor#currentAnimation
   * @readonly
   */
  Object.defineProperty(this, 'currentAnimation', {
    get: function () { return this.view.isSprite ? this.view._currentAnimationName : ''; }
  });

  /**
   * Shortcut to this.view.style.scale. Updates hit bounds on set.
   * @var {number} Actor#scale
   */
  Object.defineProperty(this, 'scale', {
    get: function () { return this.view.style.scale },
    set: function (value) { this.view.style.scale = value; }
  });

  /** Shortcut to this.view.clipRect
      @var {number} Actor#clipRect */
  Object.defineProperty(this, 'clipRect', {
    get: function () { return this.view.clipRect; },
    set: function (value) { this.view.clipRect = value; }
  });

  /** Shortcut to this.view.showHitBounds
      @method Actor#showHitBounds */
  this.showHitBounds = function () {
    this.view.showHitBounds();
  };

});
