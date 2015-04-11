/**
  * Jump up the platforms, dont fall off the bottom
  * see https://play.google.com/store/apps/details?id=au.com.phil&hl=en
  */
import scene, art;

exports = scene(function() {
  // Make the actor and background
  var background = scene.addBackground(art('bg'));
  var jumper = scene.addActor(art('jumper'), {
    ay: 15,
    followTouches: { x: true },
    zIndex: 10
  });
  scene.onAccelerometer(function(e) {
    jumper.ax = -e.twist * 10;
  });

  // Show the game score
  scene.showScore(10, 10);

  // Make the spawner
  var platformSpawner = scene.addSpawner({
      type: 'vertical',
      spawnAt: [{ x1: 30, y1: -100, x2: scene.screen.width - 200, y2: -100 }]
    },
    function (x, y, index) {
      var platform = scene.addActor(art('platform'), {
        isAnchored: true
      });
      platform.offScreenBottom(scene.removeActor);

      this.pixelDelayY = randRange(150, 200);
      return platform;
    }
  );

  // Player collision rules
  scene.onCollision(jumper, platformSpawner, function (jumper, platform) {
    if (jumper.vy > 0) {
      jumper.vy = randRange(-80, -110);
    }
  });
  scene.onCollision(jumper, scene.screen.bottom, scene.gameOver);
  scene.onCollision(jumper, [scene.screen.left, scene.screen.right], scene.screen.wrap);

  // Add the camera to follow the player
  scene.setCamera({
    follow: jumper,
    movementBounds: new Rect(0, scene.screen.midY, scene.screen.width, scene.screen.height - 100)
  });

  // Update the score
  scene.onTick(function() {
    scene.setScore(Math.floor(scene.cam.x));
  });
});