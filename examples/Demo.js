import scene, effects;

exports = scene(function() {

  // STEP 1: Show some text!
  var myText = scene.addText('Hello, World!');

  // STEP 2: Spin the text!
  var spinText = function () {
    scene.animate(myText)
      .now({ scaleX: -1 }, 1000)
      .then({ scaleX: 1 }, 1000)
      .then(spinText);
  };
  spinText();

  // STEP 3: Destroy the text!
  scene.screen.onDown(function() {
    effects.explode(myText);
    myText.destroy();
    scene.gameOver();
  });

});
