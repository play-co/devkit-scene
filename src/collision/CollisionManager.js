import .CollisionChecker;
import .ColliderMap;

/** @lends CollisionManager */
exports = Class(function(supr) {

  /**
   * Responsible for updating and managing collision checks.
   * Collision checks are registered for two subjects (or collections of subjects), `a` and `b`.
   * The check is run every tick to see if `a` and `b` have collided.
   * {@link CollisionManager#stop}, {@link CollisionManager#start}, {@link CollisionManager#remove}
   * are exposed in case you want to control the collisions manually; however, the Collision Manager is
   * smart about running collisions. If a group, `a` or `b`, is a single {@link Actor} or an array of
   * {@link Actor}s, then the collision manager will automatically remove the check when actors in question
   * are destroyed.
   * @constructs
   */
  this.init = function() {
    /** @type {ColliderMap}
        @private */
    this._colliderMap = null;
    /** @type {CollisionChecker[]}
        @private */
    this._collisionChecks = null;
    /**
     * Checks to add before updating (these checks will run next tick)
     * @type {CollisionChecker[]}
     * @private
     */
    this._checksToAdd = null;
    /**
     * Checks to remove before updating the rest
     * @type {CollisionChecker[]}
     * @private
     */
    this._checksToRemove = null;
    /** @type {number}
        @private */
    this._collisionCheckID = null;
    /** @type {boolean}
        @private */
    this._processing = null;

    this.reset();
  };

  /** Resets the collision manager completely */
  this.reset = function() {
    if (this._processing) {
      throw new Error('Cannot reset the collision manager while processing');
    }

    this._colliderMap = new ColliderMap();
    this._collisionChecks = [];
    this._checksToAdd = [];
    this._checksToRemove = [];
    this._collisionCheckID = -1;
    this._processing = false;
  };

  /**
   * @param  {CollisionChecker} collisionChecker
   * @return {number} collisionCheckID
   */
  this.registerCollision = function(collisionChecker) {
    this._collisionCheckID++;

    // create a new collision checker
    collisionChecker.onRegistered({ collisionCheckID: this._collisionCheckID });

    if (this._processing) {
      this._checksToAdd.push(collisionChecker);
    } else {
      this._addCollisionCheck(collisionChecker);
    }

    return this._collisionCheckID;
  };

  /**
   * @param  {number} dt Time in milliseconds
   */
  this.update = function(dt) {
    this._removeDeferredChecks();
    this._addDeferredChecks();

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
   * @param {number} collisionCheckID
   */
  this.remove = function(collisionCheckID) {
    if (this._processing && this._checksToRemove.indexOf(collisionCheckID) !== -1) {
      this._checksToRemove.push(collisionCheckID);
      return;
    }

    var index = this._collisionChecks.indexOf(collisionCheckID);
    if (index !== -1) {
      this._removeByIndex(index);
      this._colliderMap.remove(collisionCheckID);
    }
  };

  /**
   * Temporarily stop a collision from being checked, do not unregister it.
   * @param {number} collisionCheckID
   * @todo  implement
   */
  this.stop = function(collisionCheckID) {};

  /**
   * Start a collision being checked. No need to call this unless {@link CollisionManager#stop} has been called
   * @param {number} collisionCheckID
   */
  this.start = function(collisionCheckID) {};

  /**
   * Remove all collisions with collider as a subject
   * @param  {object} collider
   */
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

  /**
   * Append to the internal collision checks array
   * @private
   * @param {CollisionChecker} collisionChecker
   */
  this._addCollisionCheck = function(collisionChecker) {
    this._collisionChecks.push(collisionChecker);
    this._colliderMap.insert(collisionChecker);
  };

  /**
   * Remove all of the deferred removal calls and then reset the array
   * @private
   */
  this._removeDeferredChecks = function() {
    if (this._processing) {
      throw new Error('Cannot remove deferred checks while processing');
    }

    for (var i = 0; i < this._checksToRemove.length; i++) {
      this.remove(this._checksToRemove[i]);
    }
    this._checksToRemove.length = 0;
  };

  /**
   * Add all the deferred checks (emptying the array in the process)
   * @private
   */
  this._addDeferredChecks = function() {
    while (this._checksToAdd.length > 0) {
      this._addCollisionCheck(this._checksToAdd.pop());
    }
  };

  /**
   * Remove check by popping the last check off of the stack and
   * moving it to this index. This changes the order of checks.
   * @private
   * @param  {number} index
   */
  this._removeByIndex = function(index) {
    var lastCheck = this._collisionChecks.pop();
    if (index < this._collisionChecks.length) {
      this._collisionChecks[index] = lastCheck;
    }
  };

});
