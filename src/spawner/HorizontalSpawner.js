import .Spawner;

/** @lends HorizontalSpawner */
exports = Class(Spawner, function(supr) {

  /**
   * Used for spawning things in a game where the camera is moving in the x direction
   * @constructs
   * @extends Spawner
   */
  this.init = function() {
    supr(this, 'init', arguments);

    /** @type {number}
        @private */
    this._lastSpawnTime = scene.camera.x;
  };

  /** Check for the need of another spawn call */
  this.update = function() {
    if (Math.abs(scene.camera.x - this._lastSpawnTime) > this.spawnDelay) {
      this._lastSpawnTime = scene.camera.x;
      this.spawn();
    }
  };

});
