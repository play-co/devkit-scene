import entities.Entity as Entity;

/**
 * An object that contains a collection of builtin collision handlers
 */
var builtin_collision_handlers = {
  bounce:   function (entity, opts) { this.collisionBounce(entity, opts); },
  stop:     function (entity, opts) { this.collisionStop(entity, opts);   },
  gameOver: function (entity, opts) { this.scene.gameOver(entity, opts);  }
}


exports = Class(Entity, function() {
  var supr = Entity.prototype;

  this.init = function(scene, viewClass, opts) {
    this.viewClass = viewClass;
    this.opts = opts;

    supr.init.call(this, opts);

    if (opts.parent_actor) {
      this.parent_actor = opts.parent_actor;
      delete this.opts.parent_actor;
    }

    this.destroyed = false;
    this.has_reset = false;
    this.scene = scene;
    this.config = opts;
    this.collision_handlers = [];

    // Center the entity by default
    this.x = opts.x || scene.screen.width / 2;
    this.y = opts.y || scene.screen.height / 2;
  }

  this.reset = function(x, y, config) {
    this.x = x || this.x;
    this.y = y || this.y;
    this.config = config || this.config;

    this.has_reset = true;
    this.destroyed = false;
    this.config.ax = this.ax;
    this.config.ay = this.ay;
    this.config.vx = this.vx;
    this.config.vy = this.vy;
    supr.reset.call(this, this.x, this.y, this.config);

    if (this.view.resetAllAnimations) {
      this.view.resetAllAnimations(this.config);

      // FIXME This is a hack to get around devkit-entities not knowing how to autosize SpriteViews
      //       but knowing how to autosize ImageViews if the config's image field is set.
      this.config.image = this.view.getFrame(this.config.defaultAnimation, 0)._originalURL;
      supr.reset.call(this, this.x, this.y, this.config);

      // The purpose of this is to start animations that could not be started before calling the
      // resetAllAnimations function. These variables are set in play() and loop()
      this.initial_function.apply(this, this.initial_arguments);
    }
  }

  this.update = function(dt) {
    if (this.destroyed) {
      console.warn('Will not update destroyed Actor.');
      return;
    }

    supr.update.call(this, dt);

    // Check for collisions
    // TODO refactor, multiple collisions?
    for (var i in this.collision_handlers) {
      c = this.collision_handlers[i];

      against = c.entity.collidesWith(this);
      if (against === true) against = c.entity;

      if (against) {
        c.handler.call(this, against, c.opts);
      }
    }

    // Ugh... check for offscreen conditions...
    if (this.offScreenLeftHandler) {
      var rightBound  = this.x + this.hitBounds.x + this.hitBounds.w;
      if (rightBound <= 0) this.offScreenLeftHandler();
    }

    if (this.offScreenRightHandler) {
      var leftBound = this.x - this.hitBounds.x;
      if (leftBound >= scene.screen.width) this.offScreenRightHandler();
    }

    if (this.offScreenTopHandler) {
      var bottomBound = this.y + this.hitBounds.y + this.hitBounds.h;
      if (bottomBound <= 0) this.offScreenTopHandler();
    }

    if (this.offScreenBottomHandler) {
      var topBound = this.y - this.hitBounds.y;
      if (topBound >= scene.screen.height) this.offScreenBottomHandler();
    }
  }

  /**
   * This function destroys the Actor, as in, removes it from the scene
   */
  this.destroy = function() {
    this.destroyed = true;
    this.view.removeFromSuperview();
  }

  /**
   * This function stops all input to the actor
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
   * collision([collidable-1, collidable-2, ...], handler, [options])
   * ~ collidable-n    a object or list of objects that can be collided with
   * ~ handler         a string that identifies a handler or a callback function
   * ~ options         a list of extra options to be passed to the handler
   */
  this.collision = function() {
    var handler;
    var args = Array.prototype.slice.call(arguments);
    opts = args.pop();

    if (typeof(opts) !== 'object') {
      handler = opts;
      opts = {};
    } else {
      handler = args.pop();
    }

    if (typeof(handler) === 'string') {
      handler = builtin_collision_handlers[handler];
    }

    for (var i in args) {
      this.collision_handlers.push({
        entity: args[i],
        handler: handler,
        opts: opts
      });
    }

    return this;
  }

  /**
   * Special handlers for when something goes offscreen on the respective sides
   */
  this.offScreenTop    = function(handler) { this.offScreenTopHandler    = handler; return this; }
  this.offScreenBottom = function(handler) { this.offScreenBottomHandler = handler; return this; }
  this.offScreenLeft   = function(handler) { this.offScreenLeftHandler   = handler; return this; }
  this.offScreenRight  = function(handler) { this.offScreenRightHandler  = handler; return this; }

  /**
   * play(animation)
   */
  this.play = function(animation) {
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
    if (this.has_reset) {
      this.view.startAnimation(animation, { loop: true });
      this.view.resume();
    } else {
      this.initial_function = this.loop;
      this.initial_arguments = Array.prototype.slice.call(arguments);
    }

    return this;
  }

  /**
   * The bounce collision handler, so it can be called from a more complicated one
   *
   * TODO cleanup
   */
  this.collisionBounce = function(entity, opts) {
    px = this.x
    py = this.y
    this.resolveCollidingStateWith(entity)

    // Check if we are bouncing in a vertical or horizontal manner
    if (Math.abs(this.x - px) > Math.abs(this.y - py)) {
      this.vx = -this.vx;
    } else {
      this.vy = -this.vy;
    }
  }

  this.collisionStop = function(entity, opts) {
    this.resolveCollidingStateWith(entity);
    this.vx = 0;
    this.vy = 0;
  }
});
