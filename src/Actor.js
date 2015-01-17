import entities.Entity as Entity;

/**
 * An object that contains a collection of builtin collision handlers 
 */
var builtin_collision_handlers = {
  bounce:
    function(entity, opts) {
      px = this.x
      py = this.y
      this.resolveCollidingStateWith(entity)

      // Check if we are bouncing in a vertical or horizontal manner
      if (Math.abs(this.x - px) > Math.abs(this.y - py)) {
        this.vx = -this.vx;
      } else {
        this.vy = -this.vy;
      }
    },

  stop:
    function(entity, opts) {
      this.resolveCollidingStateWith(entity);
      this.vx = 0;
      this.vy = 0;
    },

  gameOver:
    function(entity, opts) {
      this.scene.gameOver(opts);
    }
}


exports = Class(Entity, function() {
  var VELOCITY_MULTIPLIER = 2;
  var ACCELERATION_MULTIPLIER = 1; 
  var supr = Entity.prototype;

  this.init = function(scene, opts) {
    supr.init.call(this, opts);
    
    this.scene = scene;
    this.config = opts;
    this.collision_handlers = [];

    // Center the entity by default
    this.x = opts.x || GC.app.bgWidth / 2;
    this.y = opts.y || GC.app.bgHeight / 2;
  }

  this.reset = function() {
    this.config.ax = this.ax;
    this.config.ay = this.ay;
    this.config.vx = this.vx;
    this.config.vy = this.vy;
    supr.reset.call(this, this.x, this.y, this.config);
  }

  this.update = function(dt) {
    supr.update.call(this, dt * .01);
    for (var i in this.collision_handlers) {
      c = this.collision_handlers[i];
      if (this.collidesWith(c.entity)) {
        c.handler.call(this, c.entity, c.opts)
      }
    }
  }

  this.destroy = function() {
    this.view.removeFromSuperview()
  }

  this.stop = function() {
    delete this.view.onInputSelect;
  }

  /**
   * onTouch
   * ~ callback function for an onTouch event
   */
  this.onTouch = function(cb) {
    this.view.onInputSelect = cb;
  }

  /**
   * collision([collidable-1, collidable-2, ...], handler, [options])
   * ~ collidable-n    a object or list of objects that can be collided with
   * ~ handler         a string that identifies a handler or a callback function
   * ~ options         a list of extra options to be passed to the handler
   * 
   * TODO add support for entity pools
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
      })
    }
  }
})
