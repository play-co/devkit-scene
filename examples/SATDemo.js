/**
  * @requires scene x.x.x
  */
import scene, effects, communityart;

// First we have to tell scene to use SAT
scene.setActorCtor(scene.actor.SAT);

exports = scene(function() {

  // The geometry art has some good angles, lets use the enemy triangle
  //   (keep in mind that your art must contain the proper vertex information to
  //    use with SAT)
  var targetArt = communityart('geom/enemy_2', 'SAT');
  var target = scene.addActor(targetArt, { scale: 5 });

  var text = scene.addText('debug text', 20, 20);

  // Check out this new actors shape :o
  console.log('Check out this new actors shape:', target.shape);

  // If you want to see what the debug drawing would look like, check this out
  //   NOTE: This will not work on native devkit
  target.view.debugDraw = true;

  // Now lets try rotating this triangle
  target.onTick(function(dt) {
    // target.r += 0.025;
    // target.y += (100 - target.y) * 0.01;

    var currentTouch = scene.screen.defaultTouch;
    var touchingTarget = !!(currentTouch && target.shape.contains(currentTouch.x, currentTouch.y));
    text.setText('Touching: ' + touchingTarget);
  });

});
