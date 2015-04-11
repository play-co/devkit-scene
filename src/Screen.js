/**
  * @class Screen
  * @extends Rect
  */
exports = function() {
  /** @var {Wall} Screen#left */
  this.left = null;
  /** @var {Wall} Screen#right */
  this.right = null;
  /** @var {Wall} Screen#top */
  this.top = null;
  /** @var {Wall} Screen#bottom */
  this.bottom = null;

  /** @var {number} Screen#midX */
  this.midX = 0;
  /** @var {number} Screen#midY */
  this.midY = 0;

  /**
    * Determines which wall was hit, and inverts the actors velocity in the respective axis.
    * @func Screen#bounceOff
    * @type {onCollisionCallback}
    * @arg {Actor} actor1
    * @arg {Actor} actor2
    */
  this.bounceOff = function(actor1, actor2) {};

  /**
    * Determines which wall was hit, and wraps the actor around to the other side of the screen.
    * @func Screen#wrap
    * @type {onCollisionCallback}
    * @arg {Actor} actor1
    * @arg {Actor} actor2
    */
  this.wrap = function(actor1, actor2) {};
};

/**
  * A collidable element representing these semantic screen spaces.
  * @class Wall
  */
var Wall = function() {
};