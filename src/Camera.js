/**
  * @class Camera
  * @extends Rect
  */
exports = function() {
  /**
    * Update the camera options
    * @func Camera#update
    * @arg {Object} opts
    * @arg {Actor} [opts.follow] - This is the actor the camera will try to follow
    * @arg {Shape} [opts.movementBounds] - If follow is set, the camera will keep the actor within these screen bounds
    */
  this.update = function(opts) {};
};