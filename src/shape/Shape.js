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
    * @returns {Point}
    */
  this.getPointOn = function(result) {
    result = result || new Point();
    return result;
  };

});
