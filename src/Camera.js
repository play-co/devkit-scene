import .Actor;
import .shape.Rect as Rect;

exports = Class(Rect, function(supr) {

  /** @var {number} Camera._MAX_SIZE */
  this._MAX_SIZE = 32767;

  /**
    * Origin at top left, all numbers are in world positions, not screen positions
    * @class Camera
    * @extends Rect
    */
  this.init = function(width, height) {
    // Must first define the walls, because of Camera's custom setters on x and y
    this._x = 0;
    this._y = 0;
    /** A collidable element representing the entire space left of the camera.
        @var {Rect} Camera#leftWall **/
    this.leftWall = new Rect(0, 0, this._MAX_SIZE, this._MAX_SIZE);
    /** A collidable element representing the entire space right of the camera.
        @var {Rect} Camera#rightWall **/
    this.rightWall = new Rect(0, 0, this._MAX_SIZE, this._MAX_SIZE);
    /** A collidable element representing the entire space above the camera.
        @var {Rect} Camera#topWall **/
    this.topWall = new Rect(0, 0, this._MAX_SIZE, this._MAX_SIZE);
    /** A collidable element representing the entire space below the camera.
        @var {Rect} Camera#bottomWall **/
    this.bottomWall = new Rect(0, 0, this._MAX_SIZE, this._MAX_SIZE);


    // Now initilize super
    supr(this, 'init', [0, 0, width, height]);


    /** The camera will keep this {@link Actor} inside of the {@link Camera#movementBounds}
        @var {Actor} Camera#following **/
    this.following = null;
    /** The camera will keep the {@link Camera#following} inside of this {@link Shape} when set.
        @var {Shape} Camera#movementBounds **/
    this.movementBounds = null;

    this.resize(width, height);
  };

  this.resize = function(width, height) {
    this.width = width;
    this.height = height;

    this.leftWall.hitOffset.x = -this._MAX_SIZE;
    this.leftWall.hitOffset.y = -this._MAX_SIZE / 2;

    this.topWall.hitOffset.x = -this._MAX_SIZE / 2;
    this.topWall.hitOffset.y = -this._MAX_SIZE;

    this.rightWall.hitOffset.x = width;
    this.rightWall.hitOffset.y = -this._MAX_SIZE / 2;

    this.bottomWall.hitOffset.x = -this._MAX_SIZE / 2;
    this.bottomWall.hitOffset.y = height;
  };

  /**
    * Set the target for the camera to follow
    * @func Camera#follow
    * @arg {Actor} target - This is the actor the camera will try to follow
    * @arg {Rect} [movementBounds] - The camera will keep the actor within these screen bounds
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
  };

  /**
    * Remove the current {@link Camera#movementBounds}
    * @func Camera#clearMovementBounds
    */
  this.clearMovementBounds = function() {
    this.movementBounds = null;
  }

  Object.defineProperties(this, {
    x: {
      get: function() { return this._x; },
      set: function(value) {
        this._x = value;
        this.leftWall.x = value;
        this.rightWall.x = value;
        this.topWall.x = value;
        this.bottomWall.x = value;
      }
    },
    y: {
      get: function() { return this._y; },
      set: function(value) {
        this._y = value;
        this.leftWall.y = value;
        this.rightWall.y = value;
        this.topWall.y = value;
        this.bottomWall.y = value;
      }
    }
  });

  /**
    * Return a point which has been translated to world coordinates
    * @arg {Point} pt
    * @returns {Point} worldPt
    */
  this.screenToWorld = function(pt) {
    return {
      x: pt.x + this.x,
      y: pt.y + this.y
    };
  };

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
    * Handle some sort of check and update on an actor, based on the camera and actor positions.
    * @typedef {function} cameraUpdateFunction
    * @this Scene.camera
    * @arg {Actor} actor
    * @returns {boolean} shouldUpdateView
    */

  /**
    * Determines which wall was hit, and inverts the actors velocity in the respective axis.
    * One argument must be a {@link Wall} and one must be an {@link Actor}.
    * @func Camera#bounceOff
    * @type {cameraUpdateFunction}
    * @todo
    */
  this.bounce = function(actor) {};
  this.bounceX = function(actor) {};
  this.bounceY = function(actor) {};

  /**
    * Determines which wall was hit, and wraps the actor around to the other side of the screen.
    * One argument must be a {@link Wall} and one must be an {@link Actor}.
    * @func Camera#wrap
    * @type {cameraUpdateFunction}
    * @todo
    */
  this.wrap = function(actor) {};
  this.wrapX = function(actor) {};
  this.wrapY = function(actor) {};

  /**
    * Keeps the actor completely in the view of the camera.
    * @func Camera#fullyOn
    * @type {cameraUpdateFunction}
    */
  this.fullyOn = function(actor) {
    var flagX = this.fullyOnX(actor);
    var flagY = this.fullyOnY(actor);
    return flagX || flagY;
  };
  this.fullyOnX = function(actor) {
    var actorLeft = actor.getMinHitX();
    var thisLeft = this.getMinHitX();
    if (actorLeft < thisLeft) {
      var dx = thisLeft - actorLeft;
      actor.x += dx;
      actor.prevX += dx;
      return true;
    }

    var actorRight = actor.getMaxHitX();
    var thisRight = this.getMaxHitX();
    if (actorRight > thisRight) {
      var dx = thisRight - actorRight;
      actor.x += dx;
      actor.prevX += dx;
      return true;
    }
    return false;
  };
  this.fullyOnY = function(actor) {
    var actorTop = actor.getMinHitY();
    var thisTop = this.getMinHitY();
    if (actorTop < thisTop) {
      actor.y += thisTop - actorTop;
      return true;
    }

    var actorBottom = actor.getMaxHitY();
    var thisBottom = this.getMaxHitY();
    if (actorBottom > thisBottom) {
      actor.y += thisBottom - actorBottom;
      return true;
    }
    return false;
  };
});
