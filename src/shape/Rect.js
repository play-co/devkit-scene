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
  };

  Object.defineProperties(this, {
    /** @func Rect#left
        @returns {number} */
    left: { get: function() { return this.x; } },
    /** @func Rect#right
        @returns {number} */
    right: { get: function() { return this.x + this.width; } },
    /** @func Rect#top
        @returns {number} */
    top: { get: function() { return this.y; } },
    /** @func Rect#bottom
        @returns {number} */
    bottom: { get: function() { return this.y + this.height; } }
  });

  /**
    * Returns a random point from somewhere on this shape
    * @func Shape#getPointOn
    * @returns {Point}
    */
  this.getPointOn = function(result) {
    result = result || new Point();
    result.x = Math.floor(this.x + Math.random() * this.width);
    result.y = Math.floor(this.y + Math.random() * this.height);
    return result;
  };

});