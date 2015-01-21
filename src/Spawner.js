
/**
 * Bound to entities to be called upon their release (e.g. leaving the screen)
 */
var releaseEntity = function() {
  this._spawner_using = false;
  this._spawner._free.push(this._spawner_index);
  if (this.destroy) this.destroy();
}

/**
 * The purpose of this class is to provide an interface that allows the easy generation
 * of a series of entities
 */
exports = Class(function () {
  /**
   * Spawner(constructEntity, spawnEntity, spawnCoords, [spawnDelay], [opts]) 
   * ~ constructEntity
   *     A function called when a new entity is constructed
   * ~ spawnEntity()
   *     A function called when a new entity is spawned (this = the entity)
   * ~ spawnCoords = { x: [minX, minY], y: [minY, maxY] }
   * ~ spawnDelay = [minDelay, maxDelay]
   *     If spawnDelay is undefined then entities will only spawn when spawn() is manually called
   * ~ opts - passed to the super constructor
   */
  this.init = function(constructEntity, spawnEntity, spawnCoords, spawnDelay) {
    this.spawnDelay = spawnDelay;
    this.spawnX = spawnCoords.x || [0, 0];
    this.spawnY = spawnCoords.y || [0, 0];
    this.constructEntity = constructEntity;
    this.spawnEntity = spawnEntity;

    this._entities = [];
    this._free = [];
  }

  this.reset = function() {
    if (spawnDelay) {
      this.delay = randRange(spawnDelay);
    }
  }

  /**
   * Spawns an entity, called manually or automatically based on a timer.
   */
  this.spawn = function() {
    if (this._free.length > 0) {
      e._spawner_index = this._free.shift();
      var e = this._entities[e._spawner_index];
    } else {
      var e = this.constructEntity();
      e._spawner = this;
      e._spawner_index = this._entities.push(e) - 1; 
    }

    e.x = randRange(this.spawnX);
    e.y = randRange(this.spawnY);
    e._spawner_using = true; 
    e.release = releaseEntity.bind(e);

    this.spawnEntity.call(e);
    return e;
  }

  this.update = function(dt) {
    // TODO I might want to make this a setTimeout
    if (this.spawnDelay) {
      this.delay -= dt;
      if (this.delay <= 0) {
        this.delay = randRange(this.spawnDelay);
        this.spawn();
      }
    }

    for (var k in this.entities) {
      if (this.entities[k]._spawner_using) {
        this.entities[k].update(dt);
      }
    }
  }
});
