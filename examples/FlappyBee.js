import scene, effects, communityart;

scene.splash(function() {
  scene.centerText('Flap away, bee: Tap to start!');
  scene.addBackground(communityart('flat_forest'));
});

/**
  * @requires scene 0.0.3
  */
exports = scene(function() {

  var screenH = scene.screen.height;
  var screenW = scene.screen.width;

  var bees = [];
  for (var i = 0; i < 5; i++) {
    var bee = scene.addActor(communityart('flapping_bee'));
    bee.loop('flap');
    bees.push(bee);
  }
  for (var i = 0; i < 5; i++) {
    bees.pop().destroy();
  }

  scene.addBackground(communityart('flat_forest'), { scrollX: 0.1 });
  scene.addBackground(communityart('foreground'), { scrollX: 0.5, yAlign: 'bottom' });

  var player = scene.addPlayer(communityart('flapping_bee'), { zIndex: 1000, vx: 200, ay: 2000 });
  player.loop("flap");

  scene.showScore(scene.screen.midX, 10, {color: 'black'});
  scene.camera.follow(player, new scene.shape.Rect(screenW * 0.2, -screenH, 0, screenH * 3));
  scene.onCollision(player, scene.camera.borderBottom, function(a, b) {
    if (player.y > scene.camera.bottom) { player.destroy(); }
  });

  scene.screen.onTap(function() {
    if (player.vx > 0 && !player.collidesWith(scene.camera.borderTop)) {
      player.vy = -800;
    }
  });

  var logs = scene.addGroup();

  scene.onCollision(player, logs, function() {
    if (player.vx > 0) {
      player.vx = player.vy = 0;
      player.play('crash');
      effects.shake(scene.view);
    }
  });

  scene.onCollision(logs, scene.camera.borderLeft, function(log, border) {
    if (log.getRightViewX() < scene.camera.x) { log.destroy(); }
  });

  var logSpawner = scene.addSpawner(new scene.spawner.Horizontal(logs,
    new scene.shape.Line({ x: screenW + 100, y: screenH * 0.25, y2: screenH * 0.75}),
    function (x, y, index) {

      var topLog = logs.addActor(communityart('log'), { x: x, y: y - 150 });
      var bottomLog = logs.addActor(communityart('log'), { x: x, y: y + 150 });

      topLog.y -= topLog.viewBounds.h;

      var honey = scene.addActor(communityart('hdrop'), { x: x + 20, y: y });
      scene.onCollision(player, honey, function() {
        effects.explode(honey.view);
        honey.destroy();
        scene.addScore(1);
      });

    }, 400, false ));
});