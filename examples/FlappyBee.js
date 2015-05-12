import scene, effects, communityart;

var PARALLAX_THEME = 'flappybee/parallax/forest';

scene.setTextColor("#FFFFFF");

scene.splash(function() {
  scene.addText('Tap to Start!');
  scene.addBackground(communityart(PARALLAX_THEME));
});

/**
  * @requires scene master
  */
exports = scene(function() {
  // Add backgrounds
  scene.addBackground(communityart(PARALLAX_THEME));

  // Show the score
  scene.showScore(scene.screen.center.x, 10);

  // Add the player
  var player = scene.addPlayer(communityart('flappybee/bee/yellow'), {
    zIndex: 1000,
    vx: 200,
    ay: 2000
  });

  player.onEntered(scene.camera.bottomWall, function() {
    player.destroy();
  });

  // Follow the player
  scene.camera.follow(player, new scene.shape.Rect({
    x: scene.screen.width * 0.2, y: -10000,
    width: 0, height: 30000
  }));

  // Flap when the player clicks
  scene.screen.onDown(function() {
    if (player.vx > 0) {
      player.vy = -800;
    }
  });

  // Add logs for the bee to collide with
  var obstacles = scene.addGroup();

  scene.addSpawner(new scene.spawner.Horizontal(
    new scene.shape.Line({
      x: scene.screen.width + 65,
      y: scene.screen.height * 0.25,
      y2: scene.screen.height * 0.75
    }),
    function (x, y, index) {
      var logArt = communityart('flappybee/log');
      var topLog = obstacles.addActor(logArt, { x: x, y: y - 150 - logArt.height, flipY: true });
      var bottomLog = obstacles.addActor(logArt, { x: x, y: y + 150 });

      topLog.onEntered(scene.camera.leftWall, function() {
        topLog.destroy();
        bottomLog.destroy();
        scene.addScore(1);
      });

      // EXTRA: Honey for a point
      if (Math.random() < 0.5) {
        var honey = scene.addActor(communityart('flappybee/honeyDrop'), { x: x + logArt.width / 2, y: y });
        effects.hover(honey, { loop: true });
        effects.squish(honey, { loop: true });
        scene.onCollision(player, honey, function() {
          effects.explode(honey);
          honey.destroy();
          scene.addScore(1);
        });
      }
    },
    400
  ));

  scene.onCollision(player, obstacles, function(player, log) {
    if (player.vx > 0) {
      player.vx = 0;
      player.play('crash');
      effects.shake(scene.view);
    }
  });
});
