
/**
  * This is the basic entity for all things in a scene game.  If it moves, it's and actor.
  * @class Actor
  * @this Actor
  */
exports = function() {

  /**
    * The velocity of the actor entity.
    * @memberof Actor
    */
  this.vx = 0;
  this.vy = 0;
  this.ax = 0;
  this.ay = 0;


  /**
    * Remove from screen
    * @memberof Actor
    */
  this.kill = function() {};

};
