/**
  * @class Rect
  * @extends Shape
  */
exports = function() {
  /** @var {number} Rect#width */
  this.width = 0;
  /** @var {number} Rect#height */
  this.height = 0;

  /** @func Rect#left
      @returns {number} */
  this.left = function() {};
  /** @func Rect#right
      @returns {number} */
  this.right = function() {};
  /** @func Rect#top
      @returns {number} */
  this.top = function() {};
  /** @func Rect#bottom
      @returns {number} */
  this.bottom = function() {};


  this.getPointOn = function() {};
};