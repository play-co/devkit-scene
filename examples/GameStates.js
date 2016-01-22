import scene, communityart;


// 'splash' is one of the defualt states that scene will look for.  It is the first
//   thing the player will see in game.
scene.state.add('splash', function() {
  // For this state we will simply add an image with the instructions to the screen
  var splash = scene.addImage(scene.getConfig('flappybee/instructions'));
  splash.x = scene.screen.centerX;
  splash.y = scene.screen.centerY;
}, {
  tapToContinue: true,  // Tap the screen to move to the next state, by default 'game' follows 'splash'
  clearOnTransition: true  // Remove everything from the screen when we transition
});


// `scene( ... )` is actually a shortcut to `scene.state.add('game', ...)`.  Now you know.
// All state functions take a `gameData` object, which is shared until scene is reset.
exports = scene(function(gameData) {
  // Check if this game has been initialized yet
  if (!gameData.initialized) {
    gameData.initialized = true;

    // If not, lets add a player and add some text
    gameData.player = scene.addPlayer(scene.getConfig('flappybee/bee/yellow'));
    gameData.stateText = scene.addText('State: game', { x: 10, y: 10 });
  } else {
    // The game was already initialized, just update the text
    gameData.stateText.setText('State: game');
  }

  // Tap the screen a few times, the bee will follow.
  var taps = 0;
  var touchHandler = function(pt) {
    // Basic animation
    scene.animate(gameData.player)
      .then({ x: pt.x, y: pt.y }, 200);

    taps++;
    if (taps > 3) {
      // 4th tap move to the next game state
      scene.state.enter('state2');
    }
  };
  // Register the touch handler
  scene.screen.onDown(touchHandler);
  // When we exit this state, remove the touch handler
  scene.state.onExit(function() {
    scene.screen.removeOnDown(touchHandler);
  });
});


// A basic second state for the game... This time the bee will rotate on taps
scene.state.add('state2', function(gameData) {
  // Update the explanation text
  gameData.stateText.setText('State: state2');

  var taps = 0;
  var touchHandler2 = function(pt) {
    scene.animate(gameData.player)
      .then({ rotation: Math.random() * Math.PI * 2 }, 200);

    taps++;
    if (taps > 3) {
      // Go back to the basic 'game' state
      scene.state.enter('game');
    }
  };
  // Same as in the first state
  scene.screen.onDown(touchHandler2);
  scene.state.onExit(function() {
    scene.screen.removeOnDown(touchHandler2);
  });
});
