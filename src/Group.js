
import entities.EntityPool as EntityPool;
import .Actor;

/**
  * A group of {@link Actor}s, with various functionality for operating on the group as a whole.
  * @class Group
  * @see scene.addActor
  */
exports = Class(EntityPool, function(supr) {

  this.init = function(opts) {
    opts = opts || {};
    opts.ctor = Actor;
    supr(this, "init", [opts]);
  };

  this.addActor = function(resource, x, y, opts) {
    // Two function options
    var optsObj = (typeof x === 'object') ? x : (opts || {});
    optsObj.group = this;

    return scene.addActor(resource, x, y, optsObj);
  };

  // Cache a reference to make faster direct calls
  this.updatePool = EntityPool.prototype.update;

  this.update = function(dt) {
    this.updatePool(dt);
  };

  this.destroy = function() {
    this.releaseAll();
    this.spawners = [];
  };

});

