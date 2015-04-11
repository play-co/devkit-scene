// import .Shape;

exports.line = function() {

  /**
    * Must define either {@link x2}, {@link y2}, or both.
    * @class Line
    * @extends Shape
    * @arg {Object} [opts]
    * @arg {number} [opts.x2]
    * @arg {number} [opts.y2]
    */
  this.init = function(opts) {};

  /** The endpoint for this line
      @var {number} Shape#x2 */
  this.x2 = 0;
  /** The endpoint for this line
      @var {number} Shape#y2 */
  this.y2 = 0;

  this.getPointOn = function() {};
};
