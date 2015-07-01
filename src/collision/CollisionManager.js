import .CollisionChecker;
import .ColliderMap;

/**
  * Responsible for updating and managing collision checks.
  * Collisions are registered as 2 things, `a` and `b`. The check is run every tick to see if
  * `a` and `b` have collided.
  * {@link CollisionManager#stop}, {@link CollisionManager#start}, {@link CollisionManager#remove}
  * are exposed in case you want to control the collisions manually; however, the Collision Manager is
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
    this._colliderMap = new ColliderMap();
    this._collisionChecks = [];
    this._collisionChecksToAdd = [];
    this._collisionChecksToRemove = [];
    this._checksToRemove = [];
    this.collisionCheckID = -1;
    this._processing = false;
  };

  /**
    * @func CollisionManager#registerCollision
    * @arg {CollisionChecker} collisionChecker
    * @returns {number} collisionCheckID
    */
  this.registerCollision = function(collisionChecker) {
    this.collisionCheckID++;

    // create a new collision checker
    collisionChecker.onRegistered({ collisionCheckID: this.collisionCheckID });

    if (this._processing) {
      this._collisionChecksToAdd.push(collisionChecker);
    } else {
      this._addCollisionCheck(collisionChecker);
    }

    return this.collisionCheckID;
  };

  this.update = function(dt) {
    this._removeOldChecks();
    this._addDeferredCollisionChecks();

    this._processing = true;
    // Iterate backwards so we can prune dead checks on the fly
    for (var i = this._collisionChecks.length - 1; i >= 0; i--) {
      var success = this._collisionChecks[i].run();
      if (success === false) {
        // Dead check, remove it
        this._removeByIndex(i);
      }
    }

    this._processing = false;
  };

  /**
    * Fully remove the collision check, cannot subsequently call {@link CollisionManager#start}
    * @func CollisionManager#remove
    * @arg {number} collisionCheck
    */
  this.remove = function(collisionCheck) {
    if (this._processing && this._collisionChecksToRemove.indexOf(collisionCheck) !== -1) {
      this._collisionChecksToRemove.push(collisionCheck);
      return;
    }
    var index = this._collisionChecks.indexOf(collisionCheck);
    if (index !== -1) {
      this._removeByIndex(index);
      this._colliderMap.remove(collisionCheck);
    }
  };

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

  this.removeCollisionsContaining = function(collider) {
    var checks = this._colliderMap.getCollisionChecksOn(collider);
    if (checks) {
      for (var i = 0; i < checks.length; i++) {
        var check = checks[i];
        if (this._checksToRemove.indexOf(check) === -1) {
          this._checksToRemove.push(check);
        }
      }
    }
  };

  this._addCollisionCheck = function(collisionChecker) {
    // append to the internal collision checks array
    this._collisionChecks.push(collisionChecker);
    this._colliderMap.insert(collisionChecker);
  };

  this._removeOldChecks = function() {
    for (var i = 0; i < this._checksToRemove.length; i++) {
      this.remove(this._checksToRemove[i]);
    }
    this._checksToRemove.length = 0;
  };

  this._addDeferredCollisionChecks = function() {
    while(this._collisionChecksToAdd.length > 0) {
      this._addCollisionCheck(this._collisionChecksToAdd.pop());
    }
  };

  this._removeByIndex = function(index) {
    // Remove check by popping the last check off of the stack and
    // moving it to this index. This changes the order of checks.
    var lastCheck = this._collisionChecks.pop();
    if (index < this._collisionChecks.length) { this._collisionChecks[index] = lastCheck; }
  };

});
