import scene;
import scene.shape.Rect as Rect;
//import art;

var art = function(id) {
  switch(id) {
    case "flapping_bee": return "resources/images/bees/yellow/yellowBee";
    default: return "resources/images/" + id + ".png";
  };
};


/**
  * @requires scene 0.0.1
  */

exports = scene(function() {
  var bg = scene.addBackground(art('flat_forest'), { scroll: 0.1 });
  var player = scene.addPlayer(art('flapping_bee'));
  player.loop("flap");

  scene.showScore(scene.screen.width / 2, 10);

  // Set up logs
  // var logSpawner = scene.addSpawner(new scene.spawner.Horizontal(
  //   new scene.shape.Line({x: scene.screen.width + 100, y: scene.screen.height * 0.25, y1: scene.screen.height * 0.75}),
  //   function (x, y, index) {
  //     var topLog = scene.addActor(art('log'));
  //     var bottomLog = scene.addActor(art('log'));

  //     topLog.x = bottomLog.x = x;
  //     topLog.y = y - 100 - topLog.style.height;
  //     bottomLog.y = y + 100;

  //     topLog.onContainedBy(scene.screen.left, function() {
  //       scene.addScore(1);
  //       topLog.destroy();
  //       bottomLog.destroy();
  //     });

  //     return [topLog, bottomLog];
  //   },
  //   { spawnDelay: 300 }
  // ));
  // scene.onCollision(player, logSpawner, player.destroy);

  // Set up the camera
  player.vx = 100;
  scene.camera.follow(player, new Rect(scene.screen.width * 0.2, -200, 0, scene.screen.height + 400));

  // Set up gravity
  player.ay = 980;

  scene.onCollision(player, scene.camera.borderBottom, function(a, b) {
    player.destroy();
  });

  scene.screen.onTap(function() {
    if (!player.collidesWith(scene.camera.borderTop)) {
      player.vy = -600;
    }
  });
});

scene.splash(function() {
  scene.centerText('Flap away, bee: Tap to start!');
  scene.addBackground(art('flat_forest'));
});
