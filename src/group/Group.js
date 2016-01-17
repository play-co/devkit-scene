import entities.EntityPool as EntityPool;
import scene.spawner.SpawnerManager as SpawnerManager;
import scene.utils.performance as performance;

/** @lends Group */
exports = Class(EntityPool, function () {
  var suprPrototype = EntityPool.prototype;

  /**
   * A group of {@link Actor}s, with various functionality for operating on the group as a whole.
   * @constructs
   * @arg {Object} [opts]
   * @extends EntityPool
   */
  this.init = function (opts) {
    opts = opts || {};
    opts.ctor = opts.ctor || scene.groupConfig._actorCtor;
    suprPrototype.init.call(this, opts);

    /** @var {SpawnerManager} Group#_spawnerManager
        @private */
    this._spawnerManager = new SpawnerManager();
  };

  // Local copies of a couple things because speed
  var deepClone = GLOBAL.deepClone;
  var safeActorOpts = SCENE_CONFIG.safeActorOpts;
  /**
   * A function which adds an actor to the scene, using this group.
   * @param {Object} [opts] - Contains options to be applied to the underlying {@link Actor}
   * @param {Object} [instanceOpts] - Deprecated.  Merged in to the first object.  Note: this will pollute opts object with any shared values.
   * @see Actor#reset
   */
  this.addActor = function (opts, instanceOpts) {
    performance.start('Group:addActor');
    // set some defaults
    if (opts && safeActorOpts) {
      opts = deepClone(opts);
    } else {
      opts = {};
    }
    opts.x = opts.x === void 0 ? scene.camera.x + scene.camera.width / 2 : opts.x;
    opts.y = opts.y === void 0 ? scene.camera.y + scene.camera.height / 2 : opts.y;

    if (instanceOpts) {
      combine(opts, instanceOpts);
    }

    // obtain a new actor
    var result = this.obtain(opts);
    scene.stage.addSubview(result.view);
    result.group = this;

    performance.stop('Group:addActor');
    return result;
  };

  /**
   * Add a spawner to this group's {@link SpawnerManager}.
   * @param  {Spawner} spawner
   * @return {Spawner} spawner
   * @see SpawnerManager#addSpawner
   */
  this.addSpawner = function (spawner) {
    return this._spawnerManager.addSpawner(spawner);
  };

  /**
   * @param {Spawner} spawner
   * @see SpawnerManager#removeSpawner
   */
  this.removeSpawner = function (spawner) {
    return this._spawnerManager.removeSpawner(spawner);
  };

  /**
   * @see SpawnerManager#reset
   */
  this.destroySpawners = function () {
    this._spawnerManager.reset();
  };

  /**
   * Destroy all actors in this group
   * @param  {boolean} [runDestroyHandlers]
   */
  this.destroyActors = function (runDestroyHandlers) {
    runDestroyHandlers = runDestroyHandlers !== void 0 ? runDestroyHandlers : true;
    var entities = this.entities;
    for (var i = this._freeIndex - 1; i >= 0; i--) {
      entities[i].destroy(runDestroyHandlers);
    }
  };

  /**
   * @see SpawnerManager#spawn
   */
  this.spawn = function () {
    return this._spawnerManager.spawn();
  };

  /**
   * @param  {number} dt In milliseconds
   */
  this.update = function (dt) {
    performance.start('Group:update');
    this._spawnerManager.update(dt);
    this.updatePool(dt);
    performance.stop('Group:update');
  };

  /**
   * Cache a reference to make faster direct calls
   * @method Group#updatePool
   */
  this.updatePool = suprPrototype.update;

  /**
   * Get the closest item in the group to the specified points
   * @param {number} x
   * @param {number} y
   * @param {Actor} [ignore] - An instance to ignore
   * @return {Actor} null if no entity can be found
   */
  this.getClosest = function (x, y, ignore) {
    var closestDist = 0;
    var closestEnt = null;
    this.forEachActiveActor(function (e) {
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
   * Call a function on each active actor
   * @method Group#forEachActiveActor
   * @param {forEachCallback} fn - The function to call on each active actor
   * @param {object} [ctx] - The context with which to call the callback
   */
  this.forEachActiveActor = suprPrototype.forEachActiveEntity;

  /**
   * Destroys everything related to the group
   * @param {boolean} [runDestroyHandlers]
   * @see {Group#destroySpawners}
   * @see {Group#releaseAll}
   */
  this.destroy = function (runDestroyHandlers) {
    this.destroySpawners();
    this.destroyActors(runDestroyHandlers);
  };

});

/**
 * This callback is used in a forEachActiveActor loop
 * @callback forEachCallback
 * @param {Actor} actor - an individual actor that's currently active
 * @param {number} i - the actor's index in the Group
 */
