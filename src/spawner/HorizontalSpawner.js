import .Spawner;

/**
  * Used for spawning things in a game where the camera is moving in the x direction
  * @class HorizontalSpawner
  * @extends Spawner
  */
exports = Class(Spawner, function(supr) {

  this.init = function() {
    supr(this, "init", arguments);
    this._lastSpawnTime = scene.camera.x;
  };

  this.update = function() {
    if (Math.abs(scene.camera.x - this._lastSpawnTime) > this.spawnDelay) {
      this._lastSpawnTime = scene.camera.x;
      this.spawn();
    }
  };

});