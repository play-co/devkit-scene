import scene, effects;

exports = scene(function() {

  // STEP 1: Create the text "Hello, World!" on the scene by adding the following line:
  var myText = scene.addText(170, 170, "Hello, World!", { color: "white", anchorX: 100 });

  // STEP 2: Add the next 4 lines to set the text spinning
  var spinText = function() {
    scene.animate(myText).now({ scaleX: -1 }, 1000).then({ scaleX: 1 }, 1000).then(spinText);
  };
  spinText();

  // STEP 3: Add the following callback to stop text animation when you tap screen
  scene.onTap(function() {
    scene.animate(myText).clear();
    // STEP 4: Add the next 2 lines to create an explosion of the text
    effects.explode(myText);
    myText.destroy();
  });

});
