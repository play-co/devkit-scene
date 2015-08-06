import scene.actor.Actor as Actor;
import scene.group.Group as Group;

import entities.shapes.Shape as Shape;
import entities.physics as EntityPhysics;

/** @lends CollisionChecker */
exports = Class(function() {

  /**
   * Called when a collision occurs
   * @callback onCollisionCallback
   * @param {Actor} a
   * @param {Actor} b
   */
  /**
   * Collision checks in scene are all handled by a CollisionChecker.
   * It is essentially a utility for operating EntityPhysics' collsiion support.
   * @constructs
   * @param {object}  opts
   * @param {object}  opts.a
   * @param {object}  opts.b
   * @param {onCollisionCallback} opts.callback
   * @param {boolean} [opts.allCollisions=false]
   * @param {string}  [opts.collisionType='CONTINUOUS'] Must be a valid key from {@link CollisionChecker.COLLISION_FUNCTIONS}
   */
  this.init = function(opts) {
    // From user
    /** @type {object}
        @private */
    this._a = opts.a;
    /** @type {object}
        @private */
    this._b = opts.b;
    /** @type {onCollisionCallback}
        @private */
    this._callback = opts.callback;
    /** @type {boolean}
        @private */
    this._allCollisions = opts.allCollisions || false;

    /** @type {string}
        @private */
    this._collisionType = opts.collisionType || 'CONTINUOUS';
    /** @type {object}
        @private */
    this._collisionTypeObject = exports.COLLISION_FUNCTIONS[this._collisionType];

    // defaults
    /** @type {boolean} */
    this.lastCollisionState = false;
    /** @type {boolean} */
    this.collisionState = false;

    /** @type {number}
        @private */
    this._collisionCheckID = null;
  };

  /**
   * Internally how the {@link CollisionManager} sets the ID of this check
   * @param  {object}     opts
   * @param  {number}     opts.collisionCheckID
   */
  this.onRegistered = function(opts) {
    this._collisionCheckID = opts.collisionCheckID;
  };

  /**
   * @param  {object}   a
   * @param  {object}   b
   * @param  {onCollisionCallback} cb
   * @param  {boolean}  runAll Run against all items, or stop after the first positive result.
   * @return {boolean}  Whether a positive result was obtained
   */
  this.test = function(a, b, cb, runAll) {

    if (a.noCollide || b.noCollide) {
      return false;
    }

    // Expected functionality by EntityPhysics:
    // vars : isCircle
    // funcs: getHitX, getHitY, getHitWidth, getHitHeight
    //      : getMaxHitX, getMaxHitY, getHitRadius

    var collidedFlag = false;
    // TODO: condense code with 'b' block
    if (!(a instanceof Actor || a instanceof Shape)) {
      var entities, length;
      // Find array and length
      if (a instanceof Group) {
        entities = a.entities;
        length = a._freeIndex;
      }
      else if (Array.isArray(a)) {
        entities = a;
        length = a.length;
      } else {
        console.error('Unknown entity group in collisions: \'a\' ', a);
        return false;
      }

      for (var i = length - 1; i >= 0; i--) {
        var aEntity = entities[i];
        if (this.test(aEntity, b, cb, runAll)) {
          if (!runAll) { return true; }
          else { collidedFlag = true; }
        }
      }
    }

    else if (!(b instanceof Actor || b instanceof Shape)) {
      var entities, length;
      // Find array and length
      if (b instanceof Group) {
        entities = b.entities;
        length = b._freeIndex;
      }
      else if (Array.isArray(b)) {
        entities = b;
        length = b.length;
      } else {
        console.error('Unknown entity group in collisions: \'b\' ', b);
        return false;
      }

      for (var i = length - 1; i >= 0; i--) {
        var bEntity = entities[i];
        if (this.test(a, bEntity, cb, runAll)) {
          if (!runAll) { return true; }
          else { collidedFlag = true; }
        }
      }
    }

    else {
      if (this._collisionTypeObject.collisionFn(a, b)) {
        if (!this._collisionTypeObject.testAfter
            && this._collisionTypeObject.fireCallbackFn(this)) {
          this._callback(a, b);
        }
        return true;
      }
    }

    return collidedFlag;
  };

  /**
   * Run the test between collidables a and b
   * @return {boolean} Whether a test was run
   */
  this.run = function() {
    if (this._a.active === false || this._b.active === false) { return false; }

    this.lastCollisionState = this.collisionState;
    this.collisionState = this.test(this._a, this._b, this._callback, this._allCollisions);

    if (this._collisionTypeObject.testAfter
        && this._collisionTypeObject.fireCallbackFn(this)) {
      this._callback(this._a, this._b);
    }

    return true;
  };

});

/**
 * Different modes for the collision checker to use
 * @var      {object} CollisionChecker.COLLISION_FUNCTIONS
 * @property {object} CONTINUOUS
 * @property {object} ON_EXITED
 * @property {object} ON_ENTERED
 */
exports.COLLISION_FUNCTIONS = {
  CONTINUOUS: {
    collisionFn: function(a, b) { return EntityPhysics.collide(a, b); }, // are two things colliding
    fireCallbackFn: function(collisionChecker) { return true; } // should the callback be fired in the case of a collision
  },
  ON_EXITED: {
    collisionFn: function(a, b) { return EntityPhysics.collide(a, b); },
    testAfter: true,
    fireCallbackFn: function(collisionChecker) {
      return collisionChecker.lastCollisionState && !collisionChecker.collisionState;
    }
  },
  ON_ENTERED: {
    collisionFn: function(a, b) { return EntityPhysics.isInside(a, b); },
    testAfter: true,
    fireCallbackFn: function(collisionChecker) {
      return !collisionChecker.lastCollisionState && collisionChecker.collisionState;
    }
  },
};
