/**
  * Jump up the platforms, dont fall off the bottom
  * @see https://play.google.com/store/apps/details?id=au.com.phil&hl=en
  * @requires scene 0.0.1
  */
import scene, communityart;

exports = scene(function() {
  // Make the actor and background
  var background = scene.addBackground(communityart('bg'));

  var player = scene.addPlayer(communityart('jumper'), {
    ay: 2000,
    vy: -2400,
    followTouches: { x: true },
    zIndex: 10,
    cameraFunction: scene.camera.wrapX
  });

  scene.onAccelerometer(function(e) {
    player.vx = -e.tilt * 3000;
  });

  // Show the game score
  scene.showScore(10, 10);

  var platforms = scene.addGroup();

  var platformSpawnFunction = function(x, y, index) {
    var platform = platforms.addActor(communityart('platform'), { isAnchored: true, x: x, y: y });
    platform.onEntered(scene.camera.bottomWall, function() {
      platform.destroy();
    });
  };

  // Make the spawner
  var platformSpawner = scene.addSpawner(
    new scene.spawner.Vertical(
      new scene.shape.Rect(30, -300, scene.screen.width - 200, 200),
      platformSpawnFunction,
      200
    )
  );

  // Player collision rules
  scene.onCollision(player, platforms, function (player, platform) {
    if (player.vy < 0) { return; }
    var deltaY = player.y - player.yPrev;
    var previousplayerBottom = player.getBottomHitY() - deltaY;

    var hitPlatformBottom = player.getBottomHitY() - (player.y - player.yPrev)


    if (previousplayerBottom < platform.getTopHitY()) {
      player.vy = -1350;
    }
  });

  player.onEntered(scene.camera.bottomWall, function() { player.destroy(); });

  // Add the camera to follow the player
  scene.camera.follow(
    player,
    new scene.shape.Rect(-200, scene.screen.midY, scene.screen.width + 400, scene.screen.height - 100)
  );

  // Update the score
  scene.onTick(function() {
    scene.setScore(Math.floor(-scene.camera.y));
  });
});