/**
  * Jump up the platforms, dont fall off the bottom
  * @see https://play.google.com/store/apps/details?id=au.com.phil&hl=en
  * @requires scene 0.1.9
  */
import scene, communityart;
import entities.shapes.collisionHelper as collisionHelper;

var START_PLAYER_SPEED = 400;
var MAX_PLATFORM_SPACING = 2000;

scene.setTextColor('#222');

exports = scene(function() {
  // Add the background and the player
  var background = scene.addBackground(communityart('runner/bg'));

  var player = scene.addPlayer(communityart('runner/player'), {
    x: 50,
    y: 100,
    ay: 2800,
    vx: START_PLAYER_SPEED,
    ax: 10,
    zIndex: 10
  });

  // Show the game score
  scene.showScore(10, 10);

  var platforms = scene.addGroup();
  var platformArt = communityart('runner/platform');
  var platformSpacing = platformArt.hitBounds.width * 1.2;

  var platformSpawnFunction = function(x, y, index) {
    var platform = platforms.addActor(platformArt, { isAnchored: true, x: x, y: y });
    platform.onEntered(scene.camera.leftWall, function() { platform.destroy(); });

    var playerSpeedDiff = player.vx - START_PLAYER_SPEED;
    this.spawnDelay = Math.min(platformSpacing + playerSpeedDiff, MAX_PLATFORM_SPACING);
  };

  // Make the spawner
  var platformSpawner = platforms.addSpawner(
    new scene.spawner.Horizontal(
      new scene.shape.Line({ x: scene.screen.width, y: scene.screen.height * 0.6, y2: scene.screen.height * 0.9 }),
      platformSpawnFunction,
      platformSpacing
    )
  );

  // Spawn some initial platforms
  platformSpawnFunction(0, scene.screen.height * 0.9, 0);
  platformSpawnFunction(scene.screen.width * 0.5, scene.screen.height * 0.9, 0);
  platforms.spawn();

  // Player collision rules
  scene.onCollision(player, platforms, function (player, platform) {
    if (player.vy < 0) { return; }
    // If last frame's player collision bottom was above the platform, hop
    var lastCollisionBottom = player.shape.bounds.maxY - (player.y - player.previousY);
    if (lastCollisionBottom <= platform.shape.bounds.minY) {
      player.vy = 0;
      // Move the player out of the platform
      var dy = player.shape.bounds.maxY - platform.shape.bounds.minY;
      player.y -= dy;
    }
  }, true);

  scene.screen.onDown(function() {
    player.vy = -1400;
  });

  player.onEntered(scene.camera.bottomWall, function() { player.destroy(); });

  // Add the camera to follow the player
  scene.camera.follow(player,
    new scene.shape.Rect({
      x: 0, y: 0,
      width: scene.screen.width * 0.25, height: scene.screen.height * 2
    })
  );

  // Update the score
  scene.onTick(function() {
    scene.setScore(Math.floor(scene.camera.x / 100));
  });
});
