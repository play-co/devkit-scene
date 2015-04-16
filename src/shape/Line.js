import math.geom.Point as Point;
import .Shape;

/**
  * Must define either {@link x2}, {@link y2}, or both.
  * @class Line
  * @extends Shape
  * @arg {Object} [opts]
  * @arg {number} [opts.x2]
  * @arg {number} [opts.y2]
  */
exports = Class(Shape, function(supr) {

  this.init = function(opts) {
    supr(this, "init", [opts.x || 0, opts.y || 0]);
    /** The endpoint for this line
        @var {number} Shape#x2 */
    this.x2 = (opts.x2 !== undefined) ? opts.x2 : this.x;
    /** The endpoint for this line
        @var {number} Shape#y2 */
    this.y2 = (opts.y2 !== undefined) ? opts.y2 : this.y;
  };

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