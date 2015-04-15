import .Actor;
import .shape.Rect as Rect;

/**
  * @class Camera
  * @extends Rect
  */
exports = Class(Rect, function() {

  this.init = function(width, height) {
    this._x = 0;
    this._y = 0;

    this.following = null;
    this.movementBounds = null;

    this.borderLeft = new Actor({});
    this.borderRight = new Actor({});
    this.borderTop = new Actor({});
    this.borderBottom = new Actor({});
    this.bounds = new Actor({});

    this.resize(width, height);
  };

  this.resize = function(width, height) {
    this.width = width;
    this.height = height;
    var max = 32767;
    resetWall(this.borderLeft, -max, -max / 2, max, max);
    resetWall(this.borderRight, width, -max / 2, max, max);
    resetWall(this.borderTop, -max / 2, -max, max, max);
    resetWall(this.borderBottom, -max / 2, height, max, max);
    resetWall(this.bounds, 0, 0, width, height);
  };

  /**
    * Set the target for the camera to follow
    * @func Camera#follow
    * @arg {Actor} target - This is the actor the camera will try to follow
    * @arg {Rect} movementBounds - The camera will keep the actor within these screen bounds
    */
  this.follow = function(target, movementBounds) {
    this.following = target;
    this.movementBounds = movementBounds
      || new Rect(this._x + this.width / 2, this._y + this.height / 2, 0, 0);
  };

  /**
    * Stop the camera from following an actor
    * @func Camera#stopFollowing
    */
  this.stopFollowing = function() {
    this.following = null;
    this.movementBounds = null;
  };

  Object.defineProperties(this, {
    x: {
      get: function() { return this._x; },
      set: function(value) {
        this._x = value;
        this.borderLeft.x = value;
        this.borderRight.x = value;
        this.borderTop.x = value;
        this.borderBottom.x = value;
        this.bounds.x = value;
      }
    },
    y: {
      get: function() { return this._y; },
      set: function(value) {
        this._y = value;
        this.borderLeft.y = value;
        this.borderRight.y = value;
        this.borderTop.y = value;
        this.borderBottom.y = value;
        this.bounds.y = value;
      }
    }
  });

  this.update = function(dt) {
    if (!this.following) { return; }

    var x = this.following.x - this._x;
    var y = this.following.y - this._y;

    if (x < this.movementBounds.x) {
      this.x = this.following.x - this.movementBounds.x;
    } else if (x > this.movementBounds.right) {
      this.x = this.following.x - this.movementBounds.right;
    }

    if (y < this.movementBounds.y) {
      this.y = this.following.y - this.movementBounds.y;
    } else if (y > this.movementBounds.bottom) {
      this.y = this.following.y - this.movementBounds.bottom;
    }
  };

  /**
    * Determines which wall was hit, and inverts the actors velocity in the respective axis.
    * One argument must be a {@link Wall} and one must be an {@link Actor}.
    * @func Screen#bounceOff
    * @type {onCollisionCallback}
    * @arg {Actor|Wall} actor1
    * @arg {Actor|wall} actor2
    */
  this.bounceOff = function(actor1, actor2) {};

  /**
    * Determines which wall was hit, and wraps the actor around to the other side of the screen.
    * One argument must be a {@link Wall} and one must be an {@link Actor}.
    * @func Screen#wrap
    * @type {onCollisionCallback}
    * @arg {Actor|Wall} actor1
    * @arg {Actor|Wall} actor2
    */
  this.wrap = function(actor1, actor2) {};
});

var resetWall = function(wall, x, y, width, height) {
  wall.reset(wall.x, wall.y, { isAnchored: true, hitBounds: { x: x, y: y, w: width, h: height } });
};
