import communityart;
import entities.EntityPool as EntityPool;

import scene.utils.performance as performance;

import scene.actor.Actor as Actor;
import scene.spawner.SpawnerManager as SpawnerManager;


exports = Class(EntityPool, function(supr) {

  // Cache a reference to make faster direct calls
  this.updatePool = EntityPool.prototype.update;

  /**
    * A group of {@link Actor}s, with various functionality for operating on the group as a whole.
    * @class Group
    */
  this.init = function(opts) {
    opts = opts || {};
    opts.ctor = opts.ctor || scene.groupConfig._actorCtor;
    supr(this, "init", [opts]);

    /** @var {SpawnerManager} Group#_spawnerManager */
    this._spawnerManager = null;
  };

  /**
    * A function which adds an actor to the scene, using this group.
    * @func Group#addActor
    * @param  {String|Object} resource - resource key to be resolved by community art, or opts
    * @param  {Object} [opts]
    * @see scene.addActor
    */
  this.addActor = function(resource, opts) {
    performance.start('Group:addActor');
    var resourceOpts = communityart.getConfig(resource, 'Actor');

    opts = opts || {};
    opts = merge(opts, resourceOpts);

    // set some defaults
    opts.x = opts.x === undefined ? scene.camera.x + scene.camera.width / 2 : opts.x;
    opts.y = opts.y === undefined ? scene.camera.y + scene.camera.height / 2 : opts.y;

    // obtain a new actor
    var result = this.obtain(opts);

    // add the actor to the group
    scene.stage.addSubview(result.view);
    result.group = this;
    performance.stop('Group:addActor');
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

    performance.start('Group:update');
    this.updatePool(dt);
    performance.stop('Group:update');
  };

  this.getClosest = function(x, y, ignore) {
    var closestDist = 0;
    var closestEnt = null;
    this.forEachActiveEntity(function(e) {
      if (e === ignore) {
        return;
      }

      var dx = x - e.x;
      var dy = y - e.y;
      var dist = dx * dx + dy * dy;

      if (!closestEnt || dist < closestDist) {
        closestDist = dist;
        closestEnt = e;
      }
    });

    return closestEnt;
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

