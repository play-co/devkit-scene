import scene, art;

/**
  * @requires scene 0.0.2
  */
exports = scene(function() {
  // Add the background
  scene.addBackground(art('bg1'));
  scene.addBackground(art('bg2'), { distance: 0.5 });
  scene.addBackground(art('bg3'), { distance: 0.25 });

  // Add the player
  var player = scene.addPlayer(art('spaceship'), {
    vy: -25,
    followTouches: { x: true },
    zIndex: 10
  });
  player.onTick(function(dt) {
    if (Math.abs(player.vx) > 10 && player.currentAnimation.name !== 'roll') {
      player.startAnimation('roll');
    }
  });

  // Show the game score
  scene.showScore(10, 10);

  // Make the spawners
  var enemies = scene.addGroup();
  enemies.add.spawner(
    new scene.shape.Line({ x: 30, y: -100, x2: scene.screen.width - 200 }),
    function (x, y, index) {
      var enemyType = randRangeI(3);
      var enemySpeeds = [20, 25, 30];
      var enemy = enemies.addActor(art('enemy_type' + enemyType), x, y, {
        vy: enemySpeeds[enemyType]
      });
      enemy.onContainedBy(scene.screen.bottom, enemy.destroy);

      this.spawnDelay = randRange(500, 1000 - Math.min(scene.totalDt, 500));
    }
  );

  var bullets = scene.addGroup();
  bullets.add.spawner(
    player,
    function (x, y, index) {
      var bullet = bullet.addActor(art('lazer'), x, y);
      bullet.onContainedBy(scene.screen.top, bullet.destroy);
    },
    { spawnDelay: 100 }
  );

  // Collision rules
  scene.onCollision(bullets, enemies, function(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    scene.addScore(1);
  });
  scene.onCollision(player, enemies, player.destroy);

  // Add the camera to follow the player
  scene.cam.update({
    follow: player,
    movementBounds: new scene.shape.Rect(0, scene.screen.height - 100, scene.screen.width, scene.screen.height - 100)
  });


  // EXTRA: Ultra swarm
  scene.addTimer(function() {
    var text = scene.addText('Ultra swarm!');
    scene.addTimeout(function() { text.destroy() }, 1000);

    for (var i = 0; i < scene.totalDt / (360 * 1000); i++) {
      enemies.spawn();
    }
  }, 60 * 60);


  // EXTRA: Boss
  var bossBullets = scene.addGroup();
  scene.onCollision(player, bossBullets, player.destroy);

  var spawnBossBullet = function(x, y, index) {
    bossBullets.addActor(art('bossBullet'), x, y, { vy: 25 });
  };

  // spawn him
  scene.addTimeout(function() {
    var boss = enemies.addActor(art('boss'), x, y);

    // Move the boss left and right
    animation(boss).then({ y: 100 }, 300);
    animation(boss, { loop: true })
      .then({ x: 100 }, 1000)
      .then({ x: scene.screen.width - 100 }, 1000);

    // Add as a spawner to bossBullets
    var bossBulletSpawner = bossBullets.add.spawner(boss, spawnBossBullet);

    // Remove as a spawner, once the boss is dead
    boss.onDestroy(function() {
      bossBullets.removeSpawner(bossBulletSpawner);
    });
  }, 60 * 60 * 2);
});
