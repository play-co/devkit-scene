/**
  * @requires scene x.x.x
  */
import scene, effects, communityart;

var ENEMY_SPAWN_MAX = 400;
var ENEMY_SPAWN_MIN = 40;
var SHIELD_COUNT = 6;

exports = scene(function() {
  // Add the background and the player
  var background = scene.addBackground(scene.getConfig('geom/bg'));

  var playerArt = scene.getConfig('geom/player');
  var player = scene.addPlayer(playerArt, {
    followTouches: { x: true, y: true },
    health: SHIELD_COUNT,
    zIndex: 10,
    cameraFunction: scene.camera.fullyOn
  });

  player.onTick(function(dt) {
    player.rotateAt(player.x + player.vx, player.y + player.vy);
  });

  // Show the game score
  scene.showScore(10, 10);

  // ---- BULLETS ---- //

  var bullets = scene.addGroup();
  var MAX_BULLET_BOUNCES = 3;

  var bulletArt = scene.getConfig('geom/laser');
  var bulletSpawnFunction = function(x, y, index) {
    var bullet = bullets.addActor(bulletArt, { x: x, y: y });
    var targX = player.x + player.vx;
    var targY = player.y + player.vy;

    bullet.headToward(targX, targY, 800);
    bullet.rotateAt(targX, targY);

    bullet.vx += player.vx;
    bullet.vy += player.vy;
    bullet.view.style.opacity = 1;

    bullet.hasCollided = false;
  };

  var setBulletCollided = function(bullet) {
    bullet.hasCollided = true;
    bullet.view.style.opacity = 0.4;
  };

  scene.onCollision(
    bullets,
    scene.camera.walls,
    function(bullet, wall) {
      if (bullet.hasCollided) {
        bullet.destroy();
      }

      setBulletCollided(bullet);

      var wallName = wall.wallName;
      if (wallName === 'right' || wallName === 'left') {
        bullet.vx *= -1;
      } else {
        bullet.vy *= -1;
      }
      bullet.rotateAt(bullet.x + bullet.vx, bullet.y + bullet.vy);
    },
    true
  );

  // Make the spawner
  var bulletSpawner = scene.addSpawner(
    new scene.spawner.Timed(player, bulletSpawnFunction, 40)
  );

  // ---- BAD GUYS ---- //

  var enemies = scene.addGroup();

  var enemnyAIs = [
    function(dt) {
      var closest = enemies.getClosest(this.x, this.y, this);
      if (closest) {
        this.headToward((closest.x + this.x) / 2, (closest.y + this.y) / 2, 50);
      }
    },
    function(dt) {
      this.headToward(player.x, player.y, 50);
    },
    function(dt) {
      this.headToward(player.x, player.y, 50);
    }
  ];

  var enemySpawnFunction = function(x, y, index) {
    // Skip the spawn if its close to the player
    if (dist(x, y, player.x, player.y) < playerArt.hitBounds.radius * 4) {
      return;
    }

    var enemyType = randRangeI(0, 3);
    var enemy = enemies.addActor(scene.getConfig('geom/enemy_' + enemyType), { x: x, y: y });

    enemy.onTick(enemnyAIs[enemyType]);

    enemy.onDestroy(function() {
      effects.explode(enemy, {
        images: scene.getConfig('geom/smokeParticles'),
        scale: 0.75,
        speed: 2
      });
    });

    enemySpawner.spawnDelay += (ENEMY_SPAWN_MIN - enemySpawner.spawnDelay) * 0.01;
  };

  var enemySpawner = scene.addSpawner(
    new scene.spawner.Timed(scene.camera, enemySpawnFunction, ENEMY_SPAWN_MAX)
  );

  scene.onCollision(enemies, bullets, function(enemy, bullet) {
    if (bullet.hasCollided) {
      return;
    }
    setBulletCollided(bullet);

    enemy.destroy();

    scene.addScore(1);
  }, true);

  scene.onCollision(enemies, player, function(enemy) {
    if (player.destroyed) return;

    enemy.destroy();
    player.hurt(1);
    effects.shake(background, { scale: 0.5 });

    // Dim the shield ui
    shieldImages[player.health].style.opacity = 0.5;
  });

  // ---- UI ---- //

  var shieldImages = [];
  var shieldArt = scene.getConfig('geom/shieldUI');
  var shieldImageStartX = (scene.screen.width - SHIELD_COUNT * shieldArt.width) / 2;
  for (var i = 0; i < SHIELD_COUNT; i++) {
    var image = scene.addImage(shieldArt);
    image.x = shieldImageStartX + i * shieldArt.width;
    image.y = scene.screen.height - 100;
    shieldImages.push(image);
  }

  // ---- ENDGAME ---- //
  player.onDestroy(function() {
    bulletSpawner.active = false;
    enemySpawner.active = false;

    effects.shake(scene.stage);
  });
});
