/**
  * @class Camera
  * @extends Rect
  */
exports = function() {
  /**
    * @typedef {Object} UpdateCameraOpts
    * @prop {Actor} follow - This is the actor the camera will try to follow
    * @prop {Rect} movementBounds - If follow is set, the camera will keep the actor within these screen bounds
    */
  /**
    * Set the camera options
    * @func Camera#update
    * @arg {UpdateCameraOpts} opts - options to be applied to the scene {@link Camera}
    */
  this.update = function(opts) {};
};