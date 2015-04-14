import entities.EntityPool as EntityPool;
import entities.Entity as Entity;

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
    this.entityVsEntity = [];
    this.entityVsPoolFirst = [];
    this.entityVsPoolAll = [];
    this.poolVsPoolFirst = [];
    this.poolVsPoolAll = [];
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

      var aIsPool = a instanceof EntityPool;
      var bIsPool = b instanceof EntityPool;
      // Since we can't compare pool on entity, we may need to reverse a and
      // b so it's entity on pool
      var reverseTargets = !aIsPool && bIsPool;
      var collisionData = new CollisionData(a, b, callback, reverseTargets);

      if (aIsPool && bIsPool) {
        // Pool on pool collision
        if (allCollisions) {
          this.poolVsPoolAll.push(collisionData);
        } else {
          this.poolVsPoolFirst.push(collisionData);
        }
      } else if (!aIsPool && !bIsPool) {
        // entity on entity collision
        this.entityVsEntity.push(collisionData);
      } else {
        // entity on pool collision
        if (allCollisions) {
          this.entityVsPoolAll.push(collisionData);
        } else {
          this.entityVsPoolFirst.push(collisionData);
        }
      }
    }

    return this.collisionCheckID++;
  };

  this.update = function(dt) {
    var checkCount = this.entityVsEntity.length;
    var deadHandlers = false;
    for (var i = 0; i < checkCount; i++) {
      var collisionData = this.entityVsEntity[i];
      if (collisionData.a.destroyed || collisionData.b.destroyed) {
        deadHandlers = true;
      } else if (collisionData.a.collidesWith(collisionData.b)) {
        collisionData.callback(collisionData.a, collisionData.b);
      }
    }

    if (deadHandlers) {
      this.clearDeadHandlers(this.entityVsEntity);
    }

    checkCount = this.entityVsPoolFirst.length;
    deadHandlers = false;
    for (var i = 0; i < checkCount; i++) {
      var collisionData = this.entityVsPoolFirst[i];
      if (collisionData.a.destroyed || collisionData.b.destroyed) {
        deadHandlers = true;
      } else {
        collisionData.a.onFirstCollision(collisionData.b, collisionData.callback, GC.app);
      }
    }

    if (deadHandlers) {
      this.clearDeadHandlers(this.entityVsPoolFirst);
    }

    checkCount = this.entityVsPoolAll.length;
    deadHandlers = false;
    for (var i = 0; i < checkCount; i++) {
      var collisionData = this.entityVsPoolAll[i];
      if (collisionData.a.destroyed || collisionData.b.destroyed) {
        deadHandlers = true;
      } else {
        collisionData.a.onAllCollisions(collisionData.b, collisionData.callback, GC.app);
      }
    }

    if (deadHandlers) {
      this.clearDeadHandlers(this.entityVsPoolAll);
    }

    checkCount = this.poolVsPoolFirst.length;
    for (var i = 0; i < checkCount; i++) {
      var collisionData = this.poolVsPoolFirst[i];
      collisionData.a.onFirstPoolCollisions(collisionData.b, collisionData.callback, GC.app);
    }

    checkCount = this.poolVsPoolAll.length;
    for (var i = 0; i < checkCount; i++) {
      var collisionData = this.poolVsPoolAll[i];
      collisionData.a.onAllPoolCollisions(collisionData.b, collisionData.callback, GC.app);
    }
  };

  this.clearDeadHandlers = function(handlers) {
    for (var i = handlers.length - 1; i >= 0; i--) {
      var collisionData = handlers[i];
      if (collisionData.a.destroyed || collisionData.b.destroyed) {
        var lastHandler = handlers.pop();
        if (i < handlers.length) {
          handlers[i] = lastHandler;
        }
      }
    }
  };

  /**
    * Fully remove the collision check, cannot subsequently call {@link CollisionManager#start}
    * @func CollisionManager#remove
    * @arg {number} collisionCheckID
    */
  this.remove = function(collisionCheckID) {};

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

var CollisionData = function(a, b, callback, reverseTargets) {
  if (reverseTargets) {
    this.a = b;
    this.b = a;
    this.callback = this.createReversalWrapper(callback);
  } else {
    this.a = a;
    this.b = b;
    this.callback = callback;
  }
};

CollisionData.prototype.createReversalWrapper = function(a, b, callback) {
  return function() {
    callback(b, a);
  };
};
