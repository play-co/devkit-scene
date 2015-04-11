exports = function() {
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
    * @extends Group
    * @arg {Shape} spawnAt
    * @arg {SpawnFunction} spawnFunction
    * @arg {Object} [opts]
    * @arg {Object} [opts.spawnDelay] - Either expressed as pixels or as milliseconds until the next spawn
    */
  this.init = function(spawnAt, spawnFunction, opts) {};

  /** @var {Shape|Shape[]|Point} Spawner#spawnAt */
  this.spawnAt = null;

  /** @var {function} Spawner#spawnFunction */
  this.spawnFunction = null;

  /** @var {number} Spawner#spawnDelay */
  this.spawnDelay = 0;

  /**
    * Returns a point from somewhere on {@link Spawner#spawnAt}
    * @func Spawner#getSpawnPoint
    * @returns {Point}
    */
  this.getSpawnPoint = function() {};

  /**
    * Called every tick by scene, check to see if we should spawn or not
    * @func Spawner#tick
    * @returns {Point}
    */
  this.tick = function(dt) {};
};


exports.VerticalSpawner = function() {

  /**
    * Used for spawning things in a game where the camera is moving in the y direction
    * @class VerticalSpawner
    * @extends Spawner
    */
  this.init = function() {};

  this.tick = function() {};
};

