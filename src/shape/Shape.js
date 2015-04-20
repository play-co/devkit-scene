import math.geom.Point as Point;

/**
  * @class Shape
  */
exports = Class(function() {

  this.init = function(x, y, width, height) {
    /** @var {number} Shape#x */
    this.x = x || 0;
    /** @var {number} Shape#y */
    this.y = y || 0;
  };

  /**
    * Returns a random point from somewhere on this shape
    * @func Shape#getPointOn
    * @arg {Point} result - Point to use for storing data on.
    * @returns {Point} result
    */
  this.getPointOn = function(result) {
    result = result || new Point();
    return result;
  };

  /**
    * Find the nearest point which is on the shape
    * @func Shape#getNearestPoint
    * @arg {number} x
    * @arg {number} y
    * @returns {Object} result
    * @returns {number} result.x
    * @returns {number} result.y
    * @returns {number} result.dx
    * @returns {number} result.dy
    */
  this.getNearestPoint = function(x, y) {};

});
