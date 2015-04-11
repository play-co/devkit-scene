
/**
  * @class Shape
  */
exports = function() {

  /** @var {number} Shape#x */
  this.x = 0;
  /** @var {number} Shape#y */
  this.y = 0;

  /**
    * Returns a random point from somewhere on this shape
    * @func Shape#getPointOn
    * @returns {Point}
    */
  this.getPointOn = function() {};
};

/**
  * @class Line
  * @extends Shape
  */
exports.line = function() {
  /** The endpoint for this line
      @var {number} Shape#x2 */
  this.x2 = 0;
  /** The endpoint for this line
      @var {number} Shape#y2 */
  this.y2 = 0;

  this.getPointOn = function() {};
};
