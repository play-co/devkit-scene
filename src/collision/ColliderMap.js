import scene.utils.Map as Map;

/** @lends ColliderMap */
exports = Class(function() {

  /**
   * Internally used for collision management
   * @constructs
   */
  this.init = function() {
    /** @type {Map}
        @private */
    this._map = new Map();
  };

  /**
   * Add a new collision check
   * @param  {CollisionChecker} collisionCheck
   */
  this.insert = function(collisionCheck) {
    this._getEntriesForCollider(collisionCheck._a, true).push(collisionCheck);
    this._getEntriesForCollider(collisionCheck._b, true).push(collisionCheck);
  };

  /**
   * Remove an already added collision check
   * @param  {CollisionChecker} collisionCheck
   */
  this.remove = function(collisionCheck) {
    this._removeEntry(collisionCheck, collisionCheck._a);
    this._removeEntry(collisionCheck, collisionCheck._b);
  };

  /**
   * Return all collision checks that have been added with the specified subject
   * @param  {object} collider
   * @see  CollisionChecker
   */
  this.getCollisionChecksOn = function(collider) {
    return this._getEntriesForCollider(collider, false);
  };

  /**
   * Get the array of collision checks for the specified subject, optionally creating the array if it doesnt exist
   * @private
   * @param  {object}  collider
   * @param  {boolean} createIfNoneExists
   * @return {CollisionChecker[]}
   */
  this._getEntriesForCollider = function(collider, createIfNoneExists) {
    var checksContainingCollider = this._map.get(collider);

    if (createIfNoneExists && checksContainingCollider === null) {
      checksContainingCollider = [];
      this._map.put(collider, checksContainingCollider);
    }

    return checksContainingCollider;
  };

  /**
   * Remove all references to a collision check
   * @private
   * @param  {CollisionChecker} collisionCheck
   * @param  {object}           collider
   */
  this._removeEntry = function(collisionCheck, collider) {
    var entries = this._getEntriesForCollider(collider, false);
    if (entries === null) { throw new Error('No entries for collider'); }

    var index = entries.indexOf(collisionCheck);
    if (index === -1) { throw new Error('Collision Checker not found for collider'); }

    var lastEntry = entries.pop();
    if (index < entries.length) { entries[index] = lastEntry; }

    if (entries.length === 0) {
      this._map.remove(collider);
    }
  };

});
