/**
  * This is a very simple game: There is a ball on screen, it falls down.
  * Touch the ball to juggle it.
  * @requires scene x.x.x
  */
import scene, communityart;

scene.state.add('splash', function() {
  var text = scene.addText('Juggle hamster: Tap to start!');
  scene.addBackground(scene.getConfig('abduction/bg'));
  scene.state.onExit(function () { text.destroy(); });
}, { tapToContinue: true });

exports = scene(function() {
  var actor = scene.addActor(scene.getConfig('abduction/player'), {
    ay: 500,
    cameraFunction: scene.camera.bounceX
  });
  scene.showScore(10, 10);

  // Tap the player to juggle
  actor.onTouch(function() {
    scene.addScore(1);
    actor.vx = randRange(200, 400, true);
    actor.vy = randRange(-800, -400);
  });

  actor.onEntered([scene.camera.bottomWall, scene.camera.topWall], scene.gameOver);
});
