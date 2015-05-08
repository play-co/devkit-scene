
import entities.EntityPool as EntityPool;
import .Actor;

import .spawner.SpawnerManager as SpawnerManager;

exports = Class(EntityPool, function(supr) {

  // Cache a reference to make faster direct calls
  this.updatePool = EntityPool.prototype.update;

  /**
    * A group of {@link Actor}s, with various functionality for operating on the group as a whole.
    * @class Group
    */
  this.init = function(opts) {
    opts = opts || {};
    opts.ctor = opts.ctor || Actor;
    supr(this, "init", [opts]);

    /** @var {SpawnerManager} Group#_spawnerManager */
    this._spawnerManager = null;
  };

  /**
    * A function which adds an actor to the scene, using this group.
    * @func Group#addActor
    * @see scene.addActor
    */
  this.addActor = function(resource, opts) {
    opts = opts || {};
    if (typeof resource === "string") {
      opts.url = resource;
    } else {
      opts = merge(opts, resource);
    }
    opts.x = opts.x === undefined ? scene.camera.x + scene.camera.width / 2 : opts.x;
    opts.y = opts.y === undefined ? scene.camera.y + scene.camera.height / 2 : opts.y;
    var result = this.obtain(opts);
    GC.app.stage.addSubview(result.view);
    result.group = this;
    return result;
  };

  /**
    * Ensures that {@link Group._spawnerManager} is initilized, then adds the spawner to it.
    * @func Group#addSpawner
    * @arg {Spawner} spawner
    * @returns {Spawner} spawner
    * @see SpawnerManager#addSpawner
    */
  this.addSpawner = function(spawner) {
    if (!this._spawnerManager) {
      this._spawnerManager = new SpawnerManager();
    }

    return this._spawnerManager.addSpawner(spawner);
  };

  /**
    * @func Group#removeSpawner
    * @arg {Spawner} spawner
    * @see SpawnerManager#removeSpawner
    */
  this.removeSpawner = function(spawner) {
    if (!this._spawnerManager) { return; }

    return this._spawnerManager.removeSpawner(spawner);
  };

  /**
    * @func Group#destroySpawners
    * @see SpawnerManager#reset
    */
  this.destroySpawners = function() {
    if (!this._spawnerManager) { return; }

    this._spawnerManager.reset();
  };

  /**
    * @func Group#spawn
    * @see SpawnerManager#spawn
    */
  this.spawn = function() {
    if (!this._spawnerManager) { return; }

    return this._spawnerManager.spawn();
  };

  this.update = function(dt) {
    if (this._spawnerManager) {
      this._spawnerManager.update(dt);
    }

    this.updatePool(dt);
  };

  /**
    * Destroys everything related to the group
    * @func Group#destroy
    * @see {Group#destroySpawners}
    * @see {Group#releaseAll}
    */
  this.destroy = function(runDestroyHandlers) {
    runDestroyHandlers = runDestroyHandlers !== undefined ? runDestroyHandlers : true;
    this.destroySpawners();
    var entities = this.entities;
    for (var i = this._freeIndex - 1; i >= 0; i--) {
      entities[i].destroy(runDestroyHandlers);
    }
  };

});

