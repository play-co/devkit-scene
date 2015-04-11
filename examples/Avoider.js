import scene, art;

scene.splash(function() {
  scene.addText('Avoider: Tap to start!');
  scene.addBackground(art('starscape_2');
});

scene(function() {
  var bg = scene.addBackgroundLayer(art('starcape_1'), { scroll: 0.01 });
  var player = scene.addPlayer(art('rocketship'), {
    followTouches: true,
    zIndex: 10
  });
  scene.showScore(10, 10);

  var enemySpawner = scene.addSpawner(new scene.spawner.Spawner(
    [
      new scene.shape.Line({ x: 0, y: scene.screen.height, y2: 0 }),
      new scene.shape.Line({ x: 0, y: 0, x2: scene.screen.width, }),
      new scene.shape.Line({ x: scene.screen.width, y: 0, y2: scene.screen.height })
    ],
    function (x, y, index) {
      var enemy = scene.addActor(art('angry_bullet'));
      enemy.onEscaped(scene.screen, enemy.destroy);

      var randomPoint = scene.screen.getPointOn();
      enemy.headToward(randomPoint.x, randomPoint.y, randRange(10, 20));

      return enemy;
    },
    { spawnDelay: 750 }
  ));

  scene.onCollision(player, enemySpawner, player.destroy);

  scene.onTick(function(dt) {
    scene.addScore(Math.round(dt / 10));
  });
});
