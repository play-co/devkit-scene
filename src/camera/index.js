import .Camera;

/** @lends scene */
exports = {

  /**
   * The scene camera is useful for following around an Actor. The camera can be
   * thought of as the rectangular region of world space that is currently visible to the user.
   * Default size is 576 x 1024
   * @type Camera
   */
  camera: null,

  __listeners__: [
    {
      event: 'initGame',
      cb: function () {
        this.camera = new Camera(this.screen.width, this.screen.height);
      }
    },
    {
      event: 'updateScreenDimensions',
      cb: function () {
        if (this.camera) {
          this.camera.resize(this.scaleManager.width, this.scaleManager.height);
        }
      }
    },
    // Restart
    {
      event: 'restartGame',
      cb: function() {
        this.camera.stopFollowing();
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.update();
        this.stage.style.x = 0;
        this.stage.style.y = 0;
      }
    },
    // Tick
    {
      event: 'tickUI',
      cb: function(dt) {
        var cam = this.camera;

        if (cam.hasChanged()) {
          var stageStyle = this.stage.style;
          var dx = cam.deltaX;
          var dy = cam.deltaY;
          stageStyle.x -= dx;
          stageStyle.y -= dy;
          this.background.scroll(-dx, -dy);
        }

        cam.update(dt);
      }
    }
  ]

};
