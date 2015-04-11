
exports = function() {

  /**
    * This is the basic entity for all things in a scene game.  If it moves, it's and actor.
    * @class Actor
    * @extends Entity
    * @arg {Object} [opts]
    * @arg {boolean|Object} [opts.followTouches] - Follow touches on the screen, or follow one or both axis (if argument type is Object)
    */
  this.init = function(opts) {};

  /**
    * The velocity of the actor entity.
    * @var {number} Actor#vx
    */
  this.vx = 0;
  /** @var {number} Actor#vy */
  this.vy = 0;
  /**
    * The accelleration of the actor entity.
    * @var {number} Actor#ax
    */
  this.ax = 0;
  /** @var {number} Actor#ay */
  this.ay = 0;

  /** If true, the entity will not move when colliding with other entities.
      @var {boolean} Actor#isAnchored */
  this.isAnchored = false;

  /**
    * Fire {@link callback} when this {@link Actor} is completely inside {@link target}
    * @func Actor#onContainedBy
    * @arg {Actor} target
    * @arg {function} callback
    */
  this.onContainedBy = function(target, callback) {};

  /**
    * Remove from screen
    * @func Actor#destroy
    */
  this.destroy = function() {};

};
