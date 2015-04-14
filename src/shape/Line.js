import .Shape;

/**
  * Must define either {@link x2}, {@link y2}, or both.
  * @class Line
  * @extends Shape
  * @arg {number} x
  * @arg {number} y
  * @arg {number} x2
  * @arg {number} y2
  */
exports = Class(Shape, function(supr) {

  this.init = function(x, y, x2, y2) {
    supr(this, "init", [x, y]);
    /** The endpoint for this line
        @var {number} Shape#x2 */
    this.x2 = x2 || 0;
    /** The endpoint for this line
        @var {number} Shape#y2 */
    this.y2 = y2 || 0;
  };

  /**
    * Returns a random point from somewhere on this shape
    * @func Shape#getPointOn
    * @returns {Point}
    */
  this.getPointOn = function(result) {
    result = result || new Point();
    var startX = Math.min(this.x, this.x2);
    var endX = Math.max(this.x, this.x2);
    var random = Math.random();
    result.x = Math.floor(startX + random * (endX - startX));
    result.y = this.y * random + this.y2 * (1 - random);
    return result;
  };

});