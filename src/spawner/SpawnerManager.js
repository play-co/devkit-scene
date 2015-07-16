
/** @lends SpawnerManager */
exports = Class(function() {

  /**
   * Manages {@link Spawner} instances.
   * @constructs
   */
  this.init = function() {
    /** @type {Spawner[]} */
    this.spawners = [];
  };

  /**
   * Call {@link Spawner#destroy} for each tracked spawner, then reset self.
   */
  this.reset = function() {
    for (var i = this.spawners.length - 1; i >= 0; i--) {
      this.spawners[i].destroy();
    }

    this.spawners = [];
  };

  /**
   * Update tracked spawners, remove complete spawners.
   * @param {number} dt In milliseconds
   */
  this.update = function(dt) {
    for (var i = this.spawners.length - 1; i >= 0; i--) {
      var spawner = this.spawners[i];
      var result = spawner.update(dt);

      if (result) {
        this._removeSpawner(i);
      }
    }
  };

  /**
   * Choose a random spawner, and then call spawn.
   * @returns {?} The results of {@link Spawner#spawn}
   */
  this.spawn = function() {
    var spawner = choose(this.spawners);
    if (spawner) {
      return spawner.spawn();
    }
  };

  /**
   * Add a new spawner to the manager to be automatically updated and removed when appropriate.
   * @param  {Spawner} spawner
   * @return {Spawner} spawner
   */
  this.addSpawner = function(spawner) {
    this.spawners.push(spawner);
    spawner.setManager(this);
    return spawner;
  };

  /**
   * Remove a spawner from the manager.
   * @param {Spawner} spawner
   */
  this.removeSpawner = function(spawner) {
    var index = this.spawners.indexOf(spawner);
    if (index >= 0) {
      this._removeSpawner(index);
    }
  };

  /**
   * Remove a spawner from the spawners array by index
   * @param {number} spawnerIndex
   */
  this._removeSpawner = function(spawnerIndex) {
    this.spawners.splice(spawnerIndex, 1);
  };

});
