/**
  * Jump up the platforms, dont fall off the bottom
  * @see https://play.google.com/store/apps/details?id=au.com.phil&hl=en
  * @requires scene 0.1.9
  */
import scene, communityart;

exports = scene(function () {
  var background = scene.addBackground(scene.getConfig('abduction/bg'));
  var player = scene.addPlayer(scene.getConfig('abduction/player'), {
    ay: 2000,
    vy: -2400,
    followTouches: { x: true },
    zIndex: 10,
    cameraFunction: scene.camera.wrapX
  });

  scene.showScore(10, 10);
  scene.onAccelerometer(function (e) {
    player.vx = -e.tilt * 3000;
  });

  var platforms = scene.addGroup();
  var platformSpawnFunction = function (x, y, index) {
    var platform = platforms.addActor(scene.getConfig('abduction/platform'), { x: x, y: y, fixed: true });
    platform.onEntered(scene.camera.bottomWall, function () {
      platform.destroy();
    });
  };

  var platformSpawner = scene.addSpawner(
    new scene.spawner.Vertical(
      new scene.shape.Rect({
        x: 75,
        y: -300,
        width: scene.screen.width - 75,
        height: 200
      }),
      platformSpawnFunction,
      200
    )
  );

  // Player collision rules
  scene.onCollision(player, platforms, function (player, platform) {
    if (player.vy < 0) { return; }
    // If last frame's player collision bottom was above the platform, hop
    var lastCollisionBottom = player.shape.maxY - (player.y - player.previousY);
    if (lastCollisionBottom < platform.shape.minY) {
      player.vy = -1350;
    }
  }, true);

  player.onEntered(scene.camera.bottomWall, function () {
    player.destroy();
  });

  // Add the camera to follow the player
  scene.camera.follow(player,
    new scene.shape.Rect({
      x: -400,
      y: scene.screen.centerY,
      width: scene.screen.width + 800,
      height: scene.screen.height
    })
  );

  // Update the score
  scene.onTick(function () {
    scene.setScore(Math.floor(-scene.camera.y));
  });
});
