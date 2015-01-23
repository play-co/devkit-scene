
/**
 * The purpose of this class is to provide an interface that allows the easy generation
 * of a series of entities. Originally this recycled entities, but I removed that in
 * favor of a simpler interface. If you want entity recycling, use EntityPool.
 */
exports = Class(function () {
  /**
   * Spawner(constructEntity, spawnEntity, spawnCoords, [spawnDelay], [opts])
   * ~ spawnEntity()
   *     A function called when a new entity is spawned, should return the entity
   * ~ opts = { x: [minX, minY], y: [minY, maxY], delay: [min, max] }
   *     If delay is undefined then entities will only spawn when spawn() is manually called
   */
  this.init = function(spawnEntity, opts) {
    this.spawnDelay = opts.delay;
    this.spawnX = opts.x || [0, 0];
    this.spawnY = opts.y || [0, 0];
    this.spawnEntity = spawnEntity;

    this._entities = [];
  }

  this.reset = function() {
    this.destroy();
    if (this.spawnDelay) {
      this.delay = randRange(this.spawnDelay);
    }
  }

  this.setSpawnDelay = function(spawnDelay) {
    this.spawnDelay = spawnDelay;
  }

  this.setSpawnCoords = function(spawnCoords) {
    this.spawnX = spawnCoords.x || this.spawnX;
    this.spawnY = spawnCoords.y || this.spawnY;
  }

  /**
   * Spawns an entity, called manually or automatically based on a timer.
   */
  this.spawn = function() {
    var x = randRange(this.spawnX);
    var y = randRange(this.spawnY);
    var e = this.spawnEntity(x, y);

    if (e === undefined) {
      console.error('An attempt to spawn an entity returned nothing, did you forget to return the created entity?')
    }

    e.x = x;
    e.y = y;
    var i = this._entities.push(e);

    if (e.reset) e.reset();
    return e;
  }

  /**
   * Updates the spawner and all spawned entities
   */
  this.update = function(dt) {
    // Check if we want to spawn a new minion
    // TODO I might want to make this a setTimeout
    if (this.spawnDelay) {
      this.delay -= dt;
      if (this.delay <= 0) {
        this.delay = randRange(this.spawnDelay);
        this.spawn();
      }
    }
  }

  /**
   * We don't need to actually destroy any entities, as they should be tracked
   * by the scene itself. Destroying them here would be redundant
   */
  this.destroy = function() {
    this._entities = [];
  }

  /**
   * Check if any of the entities spawned collide with the given entity or spawner
   */
  this.collidesWith = function(against) {
    for (var k in this._entities) {
      var e = this._entities[k];
      if (e.destroyed) {
        var rm = rm || [];
        rm.push(k);
      } else {
        if (against.collidesWith(e)) {
          return e;
        }
      }
    }

    // Remove stuff we don't care about
    if (rm) {
      for (var i in rm) {
        this._entities.splice(rm[i]);
      }
    }

    return false;
  }
});
