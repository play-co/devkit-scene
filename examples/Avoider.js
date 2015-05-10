import scene, effects, communityart;

/**
  * @requires scene x.x.x
  */
scene.splash(function() {
  scene.addText('Avoider: Tap to start!');
  scene.addBackground(communityart('avoider/starscape'));
});

exports = scene(function() {
  var bg = scene.addBackground(communityart('avoider/starscape'));

  var player = scene.addPlayer(communityart('avoider/rocket_ship'), {
    followTouches: true
  });

  scene.showScore(10, 10);

  var enemies = scene.addGroup();

  // Set up enemies
  var enemySpawner = scene.addSpawner(new scene.spawner.Timed(
    [
      new scene.shape.Line({ x: -100, y: scene.screen.height, y2: 0 }),
      new scene.shape.Line({ x: 0, y: -100, x2: scene.screen.width }),
      new scene.shape.Line({ x: scene.screen.width, y: 0, y2: scene.screen.height })
    ],
    function (x, y, index) {
      var enemy = enemies.addActor(communityart('avoider/enemy_ship'), { x: x, y: y });
      enemy.onExited(scene.camera, function() { enemy.destroy(); });
      enemy.headToward(player.x, player.y, randRange(100, 200));
    }, 750
  ));

  scene.onCollision(player, enemies, function() {
    effects.shake(GC.app);
    effects.explode(player);
    player.destroy();
  });

  // Add points with time
  scene.onTick(function(dt) {
    scene.setScore(Math.floor(scene.totalDt * 0.001));
  });
});