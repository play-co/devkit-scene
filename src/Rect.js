/**
  * @class Rect
  */
exports = function() {
  /** @var {number} Rect#x */
  this.x = 0;
  /** @var {number} Rect#y */
  this.y = 0;
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
};