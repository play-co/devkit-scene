import ..Actor as Actor;
import ..Group as Group;

var CC = Class(function() {

  this.init = function(opts) {
    // From user
    this._a = opts.a;
    this._b = opts.b;
    this._callback = opts.callback;
    this._allCollisions = opts.allCollisions;

    // From CollisionManager
    this._collisionCheckID = opts.collisionCheckID;
  };

  this.test = function(a, b, cb, runAll) {
    // TODO: condense code with 'b' block
    if (!(a instanceof Actor)) {
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
        if (this.test(aEntity, b, cb, runAll) && !runAll) {
          return;
        }
      }
    }

    else if (!(b instanceof Actor)) {
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
        if (this.test(a, bEntity, cb, runAll) && !runAll) {
          return;
        }
      }
    }

    else {
      if(a.collidesWith(b)) {
        cb(a, b);
        return true;
      }
      return false;
    }
  };

  this.run = function() {
    if (this._a.destroyed || this._b.destroyed) { return false; }

    this.test(this._a, this._b, this._callback, this._allCollisions);

    return true;
  };

});

exports = CC;
