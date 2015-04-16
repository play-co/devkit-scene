import scene, effects, communityart;

scene.splash(function() {
  scene.centerText('Flap away, bee: Tap to start!');
  scene.addBackground(communityart('flat_forest'));
});

/**
  * @requires scene 0.0.3
  */
exports = scene(function() {
  scene.addBackground(communityart('flat_forest'), { scrollX: 0.1 });
  scene.addBackground(communityart('foreground'), { scrollX: 0.5, align: 'bottom' });

  var player = scene.addPlayer(communityart('flapping_bee'), {
    zIndex: 1000,
    vx: 200,
    ay: 2000
  });
  player.loop('flap');

  scene.showScore(scene.screen.midX, 10, {color: 'black'});
  scene.camera.follow(player, new scene.shape.Rect(scene.screen.width * 0.2, -10000, 0, 30000));
  player.onEntered(scene.camera.bottomWall, function() {
    player.destroy();
  });

  scene.onTap(function() {
    if (player.vx > 0) {
      player.vy = -800;
    }
  });

  var obstacles = scene.addGroup();
  scene.onCollision(player, obstacles, function(player, log) {
    if (player.vx > 0) {
      player.vx = 0;
      player.play('crash');
      effects.shake(scene.view);
    }
  });

  scene.addSpawner(new scene.spawner.Horizontal(
    obstacles,
    new scene.shape.Line({ x: scene.screen.width + 65, y: scene.screen.height * 0.25, y2: scene.screen.height * 0.75}),
    function (x, y, index) {

      var logArt = communityart('log');
      var topLog = obstacles.addActor(logArt, x, y - 150 - logArt.h);
      var bottomLog = obstacles.addActor(logArt, x, y + 150);

      // EXTRA: Honey for a point
      // if (Math.random() < 0.1) {
      //   var honey = scene.addActor(communityart('hdrop'), x + 20, y);
      //   scene.onCollision(player, honey, function() {
      //     effects.explode(honey.view);
      //     honey.destroy();
      //     scene.addScore(1);
      //   });
      // }

      topLog.onEntered(scene.camera.leftWall, function() {
        topLog.destroy();
        bottomLog.destroy();
        scene.addScore(1);
      });

    }, 400));
});
