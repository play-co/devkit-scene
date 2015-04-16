import .CollisionChecker;

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
    this._collisionChecks = [];
    this.collisionCheckID = -1;
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

    // append to the internal collision checks array
    this._collisionChecks.push(collisionChecker) - 1;

    return this.collisionCheckID;
  };

  this.update = function(dt) {
    // Iterate backwards so we can prune dead checks on the fly
    for (var i = this._collisionChecks.length - 1; i >= 0; i--) {
      var success = this._collisionChecks[i].run();
      if (success === false) {
        // Dead check, remove it by popping the last check off of the stack
        // and replacing the dead one. This changes the order of checks.
        var lastCheck = this._collisionChecks.pop();
        if (i < this._collisionChecks.length) { this._collisionChecks[i] = lastCheck; }
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
