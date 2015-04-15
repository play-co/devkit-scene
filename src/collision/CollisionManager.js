import ..Group as Group;

/**
  * Responsible for updating, and manging collision checks.
  * Collisions are registered as 2 things, `a` and `b`; the check is the run every tick to see if
  * `a` and `b` have collided.
  * {@link CollisionManager#stop}, {@link CollisionManager#start}, {@link CollisionManager#remove}
  * are exposed in case you want to control the collisions manually, however the Collision Manager is
  * smart about running collisions. If a group, `a` or `b`, is a single {@link Actor} or an array of
  * {@link Actor}s, then the collision manager will automatically remove the check when actors in question
  * are destroyed.
  * @class CollisionManager
  */
exports = Class(function(supr) {

  this.init = function() {
    this.reset();
  };

  this.reset = function() {
    this.collisionChecks = [];
    this.collisionCheckID = -1;
  };

  /**
    * Called when a collision occurs
    * @callback onCollisionCallback
    * @arg {Actor} a
    * @arg {Actor} b
    */
  /**
    * This collision check will be run each tick. {@link callback} will be called only once per tick
    * @func CollisionManager#check
    * @arg {Actor|Actor[]|Group|Collidable} a
    * @arg {Actor|Actor[]|Group|Collidable} b
    * @arg {onCollisionCallback} callback
    * @arg {boolean} [allCollisions] - {@link callback} may be called more than once per tick
    * @returns {number} collisionCheckID
    */
  this.addCollision = function(a, b, callback, allCollisions) {
    if (Array.isArray(a)) {
      for (var i = 0; i < a.length; i++) {
        this.check(a[i], b);
      }
    } else if (Array.isArray(b)) {
      for (var i = 0; i < b.length; i++) {
        this.check(a, b[i]);
      }
    } else {
      allCollisions = allCollisions || false;
      var check = new CollisionChecker(a, b, callback, allCollisions);
      this.collisionChecks.push(check);
      return check;
    }
  };

  this.update = function(dt) {
    // Iterate backwards so we can prune dead checks on the fly
    for (var i = this.collisionChecks.length - 1; i >= 0; i--) {
      var success = this.collisionChecks[i].run();
      if (success === false) {
        // Dead check, remove it by popping the last check off of the stack
        // and replacing the dead one. This changes the order of checks.
        var lastCheck = this.collisionChecks.pop();
        if (i < this.collisionChecks.length) { this.collisionChecks[i] = lastCheck; }
      }
    }
  };

  /**
    * Fully remove the collision check, cannot subsequently call {@link CollisionManager#start}
    * @func CollisionManager#remove
    * @arg {number} collisionCheck
    */
  this.remove = function(collisionCheck) {};

  /**
    * Temporarily stop a collision from being checked, do not unregister it.
    * @func CollisionManager#stop
    * @arg {number} collisionCheckID
    */
  this.stop = function(collisionCheckID) {};

  /**
    * Start a collision being checked. No need to call this unless {@link CollisionManager#stop} has been called
    * @func CollisionManager#start
    * @arg {number} collisionCheckID
    */
  this.start = function(collisionCheckID) {};

});

var CollisionChecker = Class(function() {

  this.ENTITY_VS_ENTITY = 0;
  this.ENTITY_VS_POOL_FIRST = 1;
  this.ENTITY_VS_POOL_ALL = 2;
  this.POOL_VS_POOL_FIRST = 3;
  this.POOL_VS_POOL_ALL = 4;

  this.init = function(a, b, callback, allCollisions) {

    var aIsGroup = a instanceof Group;
    var bIsGroup = b instanceof Group;
    var reverseTargets = !aIsGroup && bIsGroup;

    if (reverseTargets) {
      this.a = b;
      this.b = a;
      this.callback = this.createReversalWrapper(callback);
    } else {
      this.a = a;
      this.b = b;
      this.callback = callback;
    }

    if (aIsGroup && bIsGroup) {
      this.mode = allCollisions ? this.POOL_VS_POOL_ALL : this.POOL_VS_POOL_FIRST;
    } else if (aIsGroup !== bIsGroup) {
      this.mode = allCollisions ? this.ENTITY_VS_POOL_ALL : this.ENTITY_VS_POOL_FIRST;
    } else {
      this.mode = this.ENTITY_VS_ENTITY;
    }

  };

  this.run = function() {

    if (this.a.destroyed || this.b.destroyed) { return false; }

    switch (this.mode) {

      case this.ENTITY_VS_ENTITY:
        if (this.a.collidesWith(this.b)) { this.callback(this.a, this.b); }
        break;

      case this.ENTITY_VS_POOL_FIRST:
        this.a.onFirstCollision(this.b, this.callback, GC.app);
        break;

      case this.ENTITY_VS_POOL_ALL:
        this.a.onAllCollisions(this.b, this.callback, GC.app);
        break;

      case this.POOL_VS_POOL_FIRST:
        this.a.onFirstPoolCollisions(this.b, this.callback, GC.app);
        break;

      case this.POOL_VS_POOL_ALL:
        this.a.onAllPoolCollisions(this.b, this.callback, GC.app);
        break;

    }

    return true;

  };

  this.createReversalWrapper = function(callback) {
    return function(a, b) { callback(b, a); };
  };

});