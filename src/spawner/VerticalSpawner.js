import .Spawner;

/**
  * Used for spawning things in a game where the camera is moving in the y direction
  * @class VerticalSpawner
  * @extends Spawner
  */

exports = Class(Spawner, function(supr) {

  this.init = function() {
    supr(this, "init", arguments);
    this._lastSpawnTime = scene.camera.y;
  };

  this.update = function() {
    if (Math.abs(scene.camera.y - this._lastSpawnTime) > this.spawnDelay) {
      this._lastSpawnTime = scene.camera.y;
      this.spawn();
    }
  };

});