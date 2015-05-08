import ..Actor as Actor;
import ..Group as Group;
import entities.shapes.Shape as Shape;

import entities.physics as EntityPhysics;

var CC = Class(function() {

  /**
    * Called when a collision occurs
    * @callback onCollisionCallback
    * @arg {Actor} a
    * @arg {Actor} b
    */
  /**
    * @class CollisionChecker
    * @arg {Object} opts
    * @arg {Object} opts.a
    * @arg {Object} opts.b
    * @arg {Object} opts.callback
    * @arg {Object} [opts.allCollisions=false]
    * @arg {Object} [opts.collisionType='CONTINUOUS']
    */
  this.init = function(opts) {
    // From user
    this._a = opts.a;
    this._b = opts.b;
    this._callback = opts.callback;
    this._allCollisions = opts.allCollisions || false;

    this._collisionType = opts.collisionType || 'CONTINUOUS';
    this._collisionTypeObject = CC.COLLISION_FUNCTIONS[this._collisionType];

    this.lastCollisionState = false;
    this.collisionState = false;
  };

  this.onRegistered = function(opts) {
    // From CollisionManager
    this._collisionCheckID = opts.collisionCheckID;
  };

  this.test = function(a, b, cb, runAll) {

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

  this.run = function() {
    if (this._a.destroyed || this._b.destroyed) { return false; }

    this.lastCollisionState = this.collisionState;
    this.collisionState = this.test(this._a, this._b, this._callback, this._allCollisions);

    if (this._collisionTypeObject.testAfter
        && this._collisionTypeObject.fireCallbackFn(this)) {
      this._callback(this._a, this._b);
    }

    return true;
  };

});

CC.COLLISION_FUNCTIONS = {
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

exports = CC;
