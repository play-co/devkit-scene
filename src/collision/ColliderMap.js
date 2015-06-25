import scene.utils.Map as Map;

exports = Class(function() {

  this.init = function() {
    this._map = new Map();
  };

  this.insert = function(collisionCheck) {
    this._getEntriesForCollider(collisionCheck._a, true).push(collisionCheck);
    this._getEntriesForCollider(collisionCheck._b, true).push(collisionCheck);
  };

  this.remove = function(collisionCheck) {
    this._removeEntry(collisionCheck, collisionCheck._a);
    this._removeEntry(collisionCheck, collisionCheck._b);
  };

  this.getCollisionChecksOn = function(collider) {
    return this._getEntriesForCollider(collider, false);
  };

  this._getEntriesForCollider = function(collider, createIfNoneExists) {
    var checksContainingCollider = this._map.get(collider);

    if (createIfNoneExists && checksContainingCollider === null) {
      checksContainingCollider = [];
      this._map.put(collider, checksContainingCollider);
    }

    return checksContainingCollider;
  };

  this._removeEntry = function(collisionCheck, collider) {
    var entries = this._getEntriesForCollider(collider, false);
    if (entries === null) { throw new Error("No entries for collider"); }

    var index = entries.indexOf(collisionCheck);
    if (index === -1) { throw new Error("Collision Checker not found for collider"); }

    var lastEntry = entries.pop();
    if (index < entries.length) { entries[index] = lastEntry; }

    if (entries.length === 0) {
      this._map.remove(collider);
    }
  };

});