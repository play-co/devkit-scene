import .Camera;

exports = {
  /**
   * The scene camera is useful for following around an Actor. The camera can be
   * thought of as the rectangular region of world space that is currently visible to the user.
   * Default size is 576 x 1024
   * @var {Camera} scene.cam
   */
  camera: null,

  __listeners__: [
    {
      event: 'init',
      priority: -100,
      cb: function () {
        this.camera = new Camera(this.screen.width, this.screen.height);
      }
    },

    {
      event: 'updateScreenDimensions',
      cb: function () {
        this.camera.resize(this.scaleManager.width, this.scaleManager.height);
      }
    }
  ]
};
