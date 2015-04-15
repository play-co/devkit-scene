
import entities.EntityPool as EntityPool;
import .Actor;

/**
  * A group of {@link Actor}s, with various functionality for operating on the group as a whole.
  * @class Group
  */
exports = Class(EntityPool, function(supr) {

  this.init = function(opts) {
    opts = opts || {};
    opts.ctor = Actor;
    supr(this, "init", [opts]);
  };

  this.addActor = function(resource, opts) {
    var imageURL = (typeof resource === "string") ? resource : resource.url;
    opts = opts || {};
    opts.url = imageURL;
    opts.parent = GC.app.stage;
    var result = this.obtain(opts.x || 0, opts.y || 0, opts);
    return result;
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

