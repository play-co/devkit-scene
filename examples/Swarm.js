import scene, effects, communityart;

/**
  * @requires scene x.x.x
  */
exports = scene(function() {

  // Add the background
  scene.addBackground(scene.getConfig('swarm/bg'));

  // Show the game score
  scene.showScore(10, 10);

  // Add the player
  var player = scene.addPlayer(scene.getConfig('swarm/spaceship'), {
    zIndex: 50,
    vy: -250,
    followTouches: { x: true, xMultiplier: 0.3 },
    cameraFunction: scene.camera.fullyOn
  });

  player.onTick(function(dt) {
    // Bank and rolling animations
    if (player.vx > 750 && player.currentAnimation !== 'roll') {
      player.play('roll');
    } else if (player.vx < -750 && player.currentAnimation !== 'bank') {
      player.play('bank');
    }
  });

  // Add the camera to follow the player
  scene.camera.follow(player,
    new scene.shape.Rect({
      x: 0, y: scene.screen.height - 100,
      width: scene.screen.width, height: scene.screen.height - 100
    })
  );

  // Make the spawners
  var enemies = scene.addGroup();
  var enemySpeeds = [100, 150, 200];
  var enemySpawner = enemies.addSpawner(new scene.spawner.Timed(
    new scene.shape.Line({ x: 30, y: -100, x2: scene.screen.width - 30 }),
    function(x, y, index, spawner) {
      var enemyType = randRangeI(3);
      var enemy = enemies.addActor(scene.getConfig('swarm/enemy_type' + enemyType), {
        x: x, y: y, vy: enemySpeeds[enemyType]
      });
      enemy.onEntered(scene.camera.bottomWall, function() { enemy.destroy(); });
      spawner.spawnDelay = randRange(50, 500 - Math.min(index, 450));
    }
  ));

  var bullets = scene.addGroup();
  bullets.addSpawner(new scene.spawner.Timed(player,
    function (x, y, index) {
      var bullet = bullets.addActor(scene.getConfig('swarm/laser'), { x: x, y: y, vy: -2500 });
      bullet.onEntered(scene.camera.topWall, function() { bullet.destroy(); });
    }, 75, true
  ));

  player.onDestroy(function() {
    effects.explode(player);
    effects.shake(GC.app);
    bullets.destroySpawners();
    bossTimer.destroy();
  });

  // Collision rules
  scene.onCollision(bullets, enemies, function(bullet, enemy) {
    effects.explode(enemy);
    enemy.destroy();
    bullet.destroy();
    scene.addScore(1);
  });

  scene.onCollision(player, enemies, function() { player.destroy(); });

  // Store the boss spawn timers on this
  var bossTimer;

  // A function we call to send the boss flying left and right
  var loopBossMovement = function(boss) {
    scene.animate(boss).clear()
      .then({ x: 100 }, 1000)
      .then({ x: scene.camera.width - 100 }, 1000)
      .then(function() { loopBossMovement(boss); });
  };

  // Triggers the boss to come in from above and start animating
  var triggerBoss = function() {
    enemySpawner.active = false;

    var boss = scene.addActor(scene.getConfig('swarm/enemy_boss'), {
      x: scene.camera.x + scene.camera.width / 2 - 100,
      y: scene.camera.y - 200,
      vy: player.vy / 2,
      health: 80
    });

    var bossBullets = scene.addSpawner(new scene.spawner.Timed(boss, function(x, y) {
      var bullet = scene.addActor(scene.getConfig('swarm/particleCircle'), { x: x, y: y });
      bullet.headToward(player.x, player.y, 100);
      bullet.onExited(scene.camera, function() { bullet.destroy(); });
      scene.onCollision(bullet, player, function() { player.destroy(); });
    }, 1500, true));

    scene.animate(boss).clear()
      .then({ vy: player.vy }, 5000)
      .then(function() { loopBossMovement(boss); });

    scene.onCollision(bullets, boss, function(bullet) {
      effects.explode(bullet, { scale: 0.5 });
      bullet.destroy();
      boss.hurt(1);
    });

    boss.onDestroy(function() {
      bossBullets.destroy();
      scene.animate(boss).clear();
      effects.explode(boss);
      effects.shake(GC.app);
      enemySpawner.active = true;

      bossSpawnTime *= 1.5;
      bossTimer = scene.addTimeout(triggerBoss, bossSpawnTime);
    });

  };

  var bossSpawnTime = 20 * 1000;
  bossTimer = scene.addTimeout(triggerBoss, bossSpawnTime);
});
