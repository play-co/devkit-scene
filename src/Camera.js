import .Actor;
import entities.shapes.Rect as Rect;

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

    this.wallOffsets = {
      left: { x: 0, y: 0 },
      top: { x: 0, y: 0 },
      right: { x: 0, y: 0 },
      bottom: { x: 0, y: 0 }
    };

    var wallOpts = { width: this._MAX_SIZE, height: this._MAX_SIZE };
    /** A collidable element representing the entire space left of the camera.
        @var {Rect} Camera#leftWall **/
    this.leftWall = new Rect(wallOpts);
    this.leftWall.fixed = true;
    /** A collidable element representing the entire space right of the camera.
        @var {Rect} Camera#rightWall **/
    this.rightWall = new Rect(wallOpts);
    this.rightWall.fixed = true;
    /** A collidable element representing the entire space above the camera.
        @var {Rect} Camera#topWall **/
    this.topWall = new Rect(wallOpts);
    this.topWall.fixed = true;
    /** A collidable element representing the entire space below the camera.
        @var {Rect} Camera#bottomWall **/
    this.bottomWall = new Rect(wallOpts);
    this.bottomWall.fixed = true;

    // Now initilize super
    var suprOpts = {
      width: width,
      height: height
    };
    supr(this, 'init', [suprOpts]);

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

    this.wallOffsets.left.x = -this._MAX_SIZE;
    this.wallOffsets.left.y = -this._MAX_SIZE / 2;

    this.wallOffsets.top.x = -this._MAX_SIZE / 2;
    this.wallOffsets.top.y = -this._MAX_SIZE;

    this.wallOffsets.right.x = width;
    this.wallOffsets.right.y = -this._MAX_SIZE / 2;

    this.wallOffsets.bottom.x = -this._MAX_SIZE / 2;
    this.wallOffsets.bottom.y = height;

    // Trigger the setters to update wall positions
    this.x = this.x;
    this.y = this.y;
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
      || new Rect({ x: this._x + this.width / 2, y: this._y + this.height / 2 });
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

        this.leftWall.x = this.wallOffsets.left.x + value;
        this.rightWall.x = this.wallOffsets.right.x + value;
        this.topWall.x = this.wallOffsets.top.x + value;
        this.bottomWall.x = this.wallOffsets.bottom.x + value;
      }
    },
    y: {
      get: function() { return this._y; },
      set: function(value) {
        this._y = value;

        this.leftWall.y = this.wallOffsets.left.y + value;
        this.rightWall.y = this.wallOffsets.right.y + value;
        this.topWall.y = this.wallOffsets.top.y + value;
        this.bottomWall.y = this.wallOffsets.bottom.y + value;
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

    if (this.following.destroyed) {
      this.stopFollowing();
      return;
    }

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

  this.wrapX = function(actor) {
    if (actor.getViewMinX() > scene.camera.right) {
      actor.x = scene.camera.left - actor.view.style.offsetX - actor.getViewWidth();
    } else if (actor.getViewMaxX() < scene.camera.x) {
      actor.x = scene.camera.right - actor.view.style.offsetX;
    }
  };

  this.wrapY = function(actor) {
    if (actor.getViewMinY() > scene.camera.bottom) {
      actor.y = scene.camera.top - actor.view.style.offsetY - actor.getViewHeight();
    } else if (actor.getViewMaxY() < scene.camera.top) {
      actor.y = scene.camera.bottom - actor.view.style.offsetY;
    }
  };

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
    var actorLeft = actor.getViewMinX();
    var thisLeft = this.x;
    if (actorLeft < thisLeft) {
      var dx = thisLeft - actorLeft;
      actor.x += dx;
      actor.prevX += dx;
      return true;
    }

    var actorRight = actor.getViewMaxX();
    var thisRight = this.right;
    if (actorRight > thisRight) {
      var dx = thisRight - actorRight;
      actor.x += dx;
      actor.prevX += dx;
      return true;
    }
    return false;
  };
  this.fullyOnY = function(actor) {
    var actorTop = actor.getViewMinY();
    var thisTop = this.top;
    if (actorTop < thisTop) {
      actor.y += thisTop - actorTop;
      return true;
    }

    var actorBottom = actor.getViewMaxY();
    var thisBottom = this.bottom;
    if (actorBottom > thisBottom) {
      actor.y += thisBottom - actorBottom;
      return true;
    }
    return false;
  };
});
