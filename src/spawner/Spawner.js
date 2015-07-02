import math.geom.Point as Point;

import scene.group.Group as Group;

exports = Class(function() {
  /**
    * @callback SpawnFunction
    * @arg {number} x
    * @arg {number} y
    * @arg {number} index - the index (since beginning of game) of the currently spawned element
    * @arg {Spawner} spawner - the spawner instance
    * @this {Spawner}
    * @return {Actor|Actor[]} newly spawned actor/s
    */
  /**
    * Calls {@link Spawner#spawnFunction} every {@link Spawner#spawnDelay}
    * @class Spawner
    * @arg {Shape} spawnAt
    * @arg {SpawnFunction} spawnFunction
    * @arg {Number} spawnDelay - Either expressed as pixels or as milliseconds until the next spawn
    * @arg {Boolean} useWorldSpace (false) - positions will be considered in-world positions
    */
  this.init = function(spawnAt, spawnFunction, spawnDelay, useWorldSpace) {

    /**
      * This is where the spawning should occur. Positions will always be screen space, not world space, unless {@link Spawner#useWorldSpace} is set
      * @var {Shape|Shape[]|Point} Spawner#spawnAt
      */
    this.spawnAt = spawnAt || { x: 0, y: 0 };

    /** @var {function} Spawner#spawnFunction */
    this.spawnFunction = spawnFunction || function () {};

    /** @var {number} Spawner#spawnDelay */
    this.spawnDelay = spawnDelay !== undefined ? spawnDelay : 500;
    /**
      * When true, {@link Spawner#spawnAt} positions will be considered in-world positions
      * @var {boolean} Spawner#useWorldSpace
      */
    this.useWorldSpace = useWorldSpace === true;

    this._cachedPoint = new Point();
    this._spawnIndex = -1;
    this._lastSpawnTime = scene.totalDt;

    this.active = true;

    this._manager = null;
  };

  /**
    * Set the spawner's manager.  Remove from the current manager if there is one.
    * @func Spawner#setManager
    * @arg {SpawnerManager} manager
    */
  this.setManager = function(manager) {
    if (this._manager) {
      this._manager.removeSpawner(this);
    }

    this._manager = manager;
  };

  /**
    * Get a new spawn point using {@link Spawner#getSpawnPoint} and then call {@link Spawner#spawnFunction}.
    * @func Spawner#spawn
    */
  this.spawn = function() {
    var spawnPoint = this.getSpawnPoint();
    this.spawnFunction(spawnPoint.x, spawnPoint.y, this._spawnIndex++, this);
  };

  /**
    * Returns a point from somewhere on {@link Spawner#spawnAt}, translated based on the current {@link scene.cam} position.
    * @func Spawner#getSpawnPoint
    * @returns {Point}
    */
  this.getSpawnPoint = function(spawnAt) {

    spawnAt = spawnAt || this.spawnAt;

    if (Array.isArray(spawnAt)) {
      var randomSpawnAt = spawnAt[Math.floor(Math.random() * spawnAt.length)];
      return this.getSpawnPoint(randomSpawnAt);
    }

    if (spawnAt.getRandomPoint) {
      this._cachedPoint = spawnAt.getRandomPoint();
    } else {
      this._cachedPoint.x = spawnAt.x;
      this._cachedPoint.y = spawnAt.y;
    }

    if (!this.useWorldSpace) {
      this._cachedPoint.x += scene.camera.x;
      this._cachedPoint.y += scene.camera.y;
    }

    return this._cachedPoint;

  };

  /**
    * Called every update by scene, check to see if we should spawn or not
    * @func Spawner#update
    */
  this.update = function(dt) {
    if (!this.active) { return; }
    if (scene.totalDt - this._lastSpawnTime > this.spawnDelay) {
      this._lastSpawnTime = scene.totalDt;
      this.spawn();
    }
  };

  /**
    * If the spawner is tracked by a manager, it will be removed from that manager.
    * @func Spawner#destroy
    */
  this.destroy = function() {
    if (this._manager) {
      this._manager.removeSpawner(this);
    }
  };

});
