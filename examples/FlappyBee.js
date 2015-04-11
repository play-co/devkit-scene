import scene, art;

scene.splash(function() {
  scene.addText('Flap away, bee: Tap to start!');
  scene.addBackground(art('flat_forest');
});

scene(function() {
  var bg = scene.addBackgroundLayer(art('flat_forest_2'), { scroll: 0.1 });
  var player = scene.addPlayer(art('flapping_bee'));
  scene.showScore(scene.screen.midX, 10);

  // Set up logs
  var logSpawner = scene.addSpawner(new scene.spawner.Horizontal(
    new scene.shape.Line({x: scene.screen.width + 100, y: scene.screen.height * 0.25, y1: scene.screen.height * 0.75}),
    function (x, y, index) {
      var topLog = scene.addActor(art('log'));
      var bottomLog = scene.addActor(art('log'));

      topLog.x = bottomLog.x = x;
      topLog.y = y - 100 - topLog.style.height;
      bottomLog.y = y + 100;

      topLog.onContainedBy(scene.screen.left, function() {
        scene.addScore(1);
        topLog.destroy();
        bottomLog.destroy();
      });

      return [topLog, bottomLog];
    },
    { spawnDelay: 300 }
  ));
  scene.onCollision(player, logSpawner, player.destroy);

  // Set up the camera
  player.vx = 10;
  scene.cam.update({
    follow: player,
    movementBounds: new scene.shape.Rect(scene.screen.width * 0.2, 0, 0, scene.screen.height)
  });

  // Set up gravity
  player.ay = 9.8;
  scene.onCollision(player, scene.screen.bottom, player.destroy);
  scene.onTouch(function() {
    player.vy = -10;
  });
});
