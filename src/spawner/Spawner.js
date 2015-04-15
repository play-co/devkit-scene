import math.geom.Point as Point;

import ..Group as Group;

exports = Class(function() {
  /**
    * @callback SpawnFunction
    * @arg {number} x
    * @arg {number} y
    * @arg {number} index - the index (since beginning of game) of the currently spawned element
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
  this.init = function(group, spawnAt, spawnFunction, spawnDelay, useWorldSpace) {

    this.group = group;
    /**
      * This is where the spawning should occur. Positions will always be screen space, not world space, unless {@link Spawner#useWorldSpace} is set
      * @var {Shape|Shape[]|Point} Spawner#spawnAt
      */
    this.spawnAt = spawnAt;

    /** @var {function} Spawner#spawnFunction */
    this.spawnFunction = spawnFunction;

    /** @var {number} Spawner#spawnDelay */
    this.spawnDelay = spawnDelay;
    /**
      * When true, {@link Spawner#spawnAt} positions will be considered in-world positions
      * @var {boolean} Spawner#useWorldSpace
      */
    this.useWorldSpace = useWorldSpace || false;

    this._cachedPoint = new Point();
    this._spawnIndex = -1;
    this._lastSpawnTime = scene.totalDt;
  };

  this.spawn = function() {
    var spawnPoint = this.getSpawnPoint();
    this.spawnFunction(spawnPoint.x, spawnPoint.y, this._spawnIndex++);
  };

  /**
    * Returns a point from somewhere on {@link Spawner#spawnAt}, translated based on the current {@link scene.cam} position.
    * @func Spawner#getSpawnPoint
    * @returns {Point}
    */
  this.getSpawnPoint = function() {
    var result = this.spawnAt.getPointOn(this._cachedPoint);
    if (!this.useWorldSpace) {
      result.x += scene.camera.x;
      result.y += scene.camera.y;
    }
    return result;
  };

  /**
    * Called every tick by scene, check to see if we should spawn or not
    * @func Spawner#tick
    */
  this.tick = function(dt) {
    if (scene.totalDt - this._lastSpawnTime > this.spawnDelay) {
      this._lastSpawnTime = scene.totalDt;
      this.spawn();
    }
  };

  this.destroy = function() {
    scene.removeSpawner(this);
  };

});
