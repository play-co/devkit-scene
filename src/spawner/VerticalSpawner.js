import .Spawner;

/** @lends VerticalSpawner */
exports = Class(Spawner, function(supr) {

  /**
   * Used for spawning things in a game where the camera is moving in the y direction
   * @constructs
   * @extends Spawner
   */
  this.init = function() {
    supr(this, 'init', arguments);

    /** @type {number}
        @private */
    this._lastSpawnTime = scene.camera.y;
  };

  /** Check for the need of another spawn call */
  this.update = function() {
    if (Math.abs(scene.camera.y - this._lastSpawnTime) > this.spawnDelay) {
      this._lastSpawnTime = scene.camera.y;
      this.spawn();
    }
  };

});
