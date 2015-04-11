import scene, art;

exports = scene(function() {
  // Make the actor and background
  var background = scene.addBackground(art('bg'));
  var player = scene.addPlayer(art('spaceship'), {
    vy: -25,
    followTouches: { x: true },
    zIndex: 10
  });

  // Show the game score
  scene.showScore(10, 10);

  // Make the spawners
  var enemySpawner = scene.addSpawner(new scene.spawner.Spawner(
    new scene.shape.Line({ x: 30, y: -100, x2: scene.screen.width - 200 }),
    function (x, y, index) {
      var enemyType = randRangeI(3);
      var enemy = scene.addActor(art('enemy_type' + enemyType));
      enemy.onContainedBy(scene.screen.bottom, enemy.destroy);

      this.spawnDelay = randRange(500, 1000);
      return enemy;
    }
  ));

  var bulletSpawner = scene.addSpawner(new scene.spawner.Spawner(
    player,
    function (x, y, index) {
      var bullet = scene.addActor(art('lazer'));
      bullet.onContainedBy(scene.screen.top, bullet.destroy);

      return bullet;
    },
    { spawnDelay: 100 }
  ));

  // Collision rules
  scene.onCollision(bulletSpawner, enemySpawner, function(bullet, enemy) {
    enemy.destroy();
    scene.addScore(1);
  });
  scene.onCollision(player, enemySpawner, player.destroy);

  // Add the camera to follow the player
  scene.cam.update({
    follow: player,
    movementBounds: new scene.shape.Rect(0, scene.screen.height - 100, scene.screen.width, scene.screen.height - 100)
  });
});