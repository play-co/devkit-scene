import scene, effects, communityart;

scene.state.add('splash', function() {
  var text = scene.addText('Avoider: Tap to start!');
  scene.addBackground(scene.getConfig('avoider/starscape'));
  scene.state.onExit(function () { text.destroy(); });
}, { tapToContinue: true });

exports = scene(function() {
  scene.showScore(10, 10);

  var player = scene.addPlayer(scene.getConfig('avoider/rocket_ship'), {
    followTouches: true
  });

  // Set up enemies
  var enemies = scene.addGroup();
  var enemySpawner = scene.addSpawner(new scene.spawner.Timed(
    [
      new scene.shape.Line({ x: -100, y: scene.screen.height, y2: 0 }),
      new scene.shape.Line({ x: 0, y: -100, x2: scene.screen.width }),
      new scene.shape.Line({ x: scene.screen.width, y: 0, y2: scene.screen.height })
    ],
    function (x, y, index) {
      var enemy = enemies.addActor(scene.getConfig('avoider/enemy_ship'), { x: x, y: y });
      enemy.onExited(scene.camera, function() { enemy.destroy(); });
      enemy.headToward(player.x, player.y, randRange(100, 200));
    }, 750
  ));

  scene.onCollision(player, enemies, function() {
    effects.shake(scene);
    effects.explode(player);
    player.destroy();
  });

  // Add points with time
  scene.onTick(function(dt) {
    scene.setScore(Math.floor(scene.totalDt * 0.001));
  });
});