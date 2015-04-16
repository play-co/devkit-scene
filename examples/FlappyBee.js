import scene, effects, communityart;

var PARALLAX_THEME = 'forest_theme';

scene.setTextColor(0x000);

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
  scene.showScore(scene.screen.midX, 10);

  // Add the player
  var player = scene.addPlayer(communityart('flapping_bee'), {
    zIndex: 1000,
    vx: 200,
    ay: 2000
  });
  player.loop('flap');

  player.onEntered(scene.camera.bottomWall, function() {
    player.destroy();
  });

  // Follow the player
  scene.camera.follow(player, new scene.shape.Rect(scene.screen.width * 0.2, -10000, 0, 30000));

  // Flap when the player clicks
  scene.onTap(function() {
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
      var logArt = communityart('log');
      var topLog = obstacles.addActor(logArt, x, y - 150 - logArt.h);
      var bottomLog = obstacles.addActor(logArt, x, y + 150);

      topLog.onEntered(scene.camera.leftWall, function() {
        topLog.destroy();
        bottomLog.destroy();
        scene.addScore(1);
      });

      // EXTRA: Honey for a point
      // if (Math.random() < 0.1) {
      //   var honey = scene.addActor(communityart('hdrop'), x + 20, y);
      //   scene.onCollision(player, honey, function() {
      //     effects.explode(honey);
      //     honey.destroy();
      //     scene.addScore(1);
      //   });
      // }
    },
    400
  ));

  scene.onCollision(player, obstacles, function(player, log) {
    if (player.vx > 0) {
      player.vx = 0;
      player.play('crash');
    }
  });
});
