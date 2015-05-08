import math.geom.Point as Point;
import .Shape;

/**
  * @class Rect
  * @extends Shape
  *
  * @arg {number} x
  * @arg {number} y
  * @arg {number} width
  * @arg {number} height
  */
exports = Class(Shape, function(supr) {

  this.init = function(x, y, width, height) {
    supr(this, "init", [x, y]);
    /** @var {number} Rect#width */
    this.width = width || 0;
    /** @var {number} Rect#height */
    this.height = height || 0;
    this.hitOffset = { x: 0, y: 0 };
  };

  /** @func Rect#left
      @returns {number} */
  this._objpLeft = { get: function() { return this.x; } };
  /** @func Rect#right
      @returns {number} */
  this._objpRight = { get: function() { return this.x + this.width; } };
  /** @func Rect#top
      @returns {number} */
  this._objpTop = { get: function() { return this.y; } };
  /** @func Rect#bottom
      @returns {number} */
  this._objpBottom = { get: function() { return this.y + this.height; } };

  Object.defineProperties(this, {
    left: this._objpLeft,
    right: this._objpRight,
    top: this._objpTop,
    bottom: this._objpBottom,
    midX: { get: function() { return this.left + this.width / 2 } },
    midY: { get: function() { return this.top + this.height / 2 } }
  });

  // Mock out some functions for EntityPhysics
  this.getHitX = this.getMinHitX = function() { return this.left + this.hitOffset.x; };
  this.getMaxHitX = function() { return this.right + this.hitOffset.x; };
  this.getHitY = this.getMinHitY = function() { return this.top + this.hitOffset.y; };
  this.getMaxHitY = function() { return this.bottom + this.hitOffset.y; };
  this.getHitWidth = function() { return this.width; }
  this.getHitHeight = function() { return this.height; }

  this.getPointOn = function(result) {
    result = result || new Point();
    result.x = Math.floor(this.x + Math.random() * this.width);
    result.y = Math.floor(this.y + Math.random() * this.height);
    return result;
  };

});