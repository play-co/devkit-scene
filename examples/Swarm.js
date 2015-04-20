import scene, communityart;

/**
  * @requires scene 0.0.2
  */
exports = scene(function() {
  // Add the background
  scene.addBackground(communityart('swarm/bg1'));
  // scene.addBackground(communityart('swarm/bg2'), { distance: 0.5 });
  // scene.addBackground(communityart('swarm/bg3'), { distance: 0.25 });

  // Add the player
  var player = scene.addPlayer(communityart('spaceship'), {
    vy: -250,
    followTouches: { x: true, xMultiplier: 0.3 },
    zIndex: 10,
    cameraFunction: scene.camera.fullyOn
  });
  player.onTick(function(dt) {
    if (Math.abs(player.vx) > 750 && player.view._currentAnimationName !== 'roll') {
      player.view.startAnimation('roll');
    }
  });

  // Show the game score
  scene.showScore(10, 10);

  // Make the spawners
  var enemies = scene.addGroup();
  enemies.addSpawner(new scene.spawner.Timed(
    new scene.shape.Line({ x: 30, y: -100, x2: scene.screen.width - 30 }),
    function (x, y, index) {
      var enemyType = randRangeI(3);
      var enemySpeeds = [100, 150, 200];
      var enemy = enemies.addActor(communityart('swarm/enemy_type' + enemyType), x, y, {
        vy: enemySpeeds[enemyType]
      });
      enemy.onEntered(scene.camera.bottomWall, function() { enemy.destroy(); });

      this.spawnDelay = randRange(50, 500 - Math.min(index, 450));
    }
  ));

  var bullets = scene.addGroup();
  bullets.addSpawner(new scene.spawner.Timed(
    player,
    function (x, y, index) {
      var bullet = bullets.addActor(communityart('swarm/laser'), x, y, {
        vy: -2500
      });

      bullet.onEntered(scene.camera.topWall, function() { bullet.destroy(); });
    },
    75, true
  ));
  player.onDestroy(function() {
    bullets.destroySpawners();
  });

  // Collision rules
  scene.onCollision(bullets, enemies, function(bullet, enemy) {
    bullet.destroy();
    enemy.hurt(1);
    scene.addScore(1);
  });
  scene.onCollision(player, enemies, function() {
    player.destroy();
  });

  // Add the camera to follow the player
  scene.camera.follow(
    player,
    new scene.shape.Rect(0, scene.screen.height - 100, scene.screen.width, scene.screen.height - 100)
  );


  // EXTRA: Ultra swarm
  scene.addInterval(function(index) {
    var text = scene.addText('Ultra swarm!');
    scene.addTimeout(function() { text.destroy() }, 2000);

    for (var i = 0; i < (index + 1) * 4; i++) {
      enemies.spawn();
    }
  }, 15 * 1000);


  // EXTRA: Boss
  var bossBullets = scene.addGroup();
  scene.onCollision(player, bossBullets, function() { player.destroy(); });

  // spawn the boss after a little while
  scene.addTimeout(function() {
    var boss = enemies.addActor(
      communityart('swarm/enemy_boss'),
      scene.camera.midX,
      scene.camera.top + 100,
      { vy: player.vy, health: 40 }
    );

    // Move the boss left and right
    // TODO: handle animations!
    // animation(boss).then({ y: 100 }, 300);
    // animation(boss, { loop: true })
    //   .then({ x: 100 }, 1000)
    //   .then({ x: scene.screen.width - 100 }, 1000);

    // Add as a spawner to bossBullets
    bossBullets.addSpawner(new scene.spawner.Timed(
      boss,
      function(x, y, index) {
        var bossBullet = bossBullets.addActor(
          communityart('swarm/particleCircle'),
          x + boss.getHitWidth() / 2, y + boss.getHitHeight() / 2,
          { vy: 500 }
        );

        bossBullet.onEntered(scene.camera.bottomWall, function() { bossBullet.destroy(); });
      },
      1000, true
    ));

    // Remove as a spawner, once the boss is dead
    boss.onDestroy(function() {
      bossBullets.destroySpawners();
    });
  }, 45 * 1000);
});
