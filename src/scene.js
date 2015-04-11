
/**
 * Construct the main scene for the game, this is where all of the gameplay is defined.
 * @namespace scene
 * @arg {function} - The function which will initialize a new game scene
 */
var scene = function(newGameFunc) {

  /**
    * @var scene.screen
    * @type {Screen}
    */
  this.screen = null;

  /**
    * @var scene.cam
    * @type {Camera}
    */
  this.cam = null;

  /**
    * Construct a splash screen to show at the beginning of the game, click once anywhere to hide the screen.
    * @func scene.splash
    * @arg {function} func
    */
  this.spash = function(func) {};

  /**
    * When called, this function will restart the game
    * @func scene.gameOver
    */
  this.gameOver = function() {};

  /**
    * Add the specified string to the center of the screen.
    * @func scene.addText
    * @example scene.addText('Hello World')
    * @example
scene.addText('Hello World', {
  align: 'center',
  size: 22
})
    * @arg {string} text - Text which will be rendered on screen
    * @arg {Object} [opts]
    * @return {TextView} Instance of new text view
    */
  this.addText = function(text, opts) {};

  /**
    * Add a background parallax layer to the game.
    * @func scene.addBackground
    * @arg {art} art
    * @arg {Object} [opts] contains options to be applied to the underlying {@link View}
    * @returns {View}
    */
  this.addBackground = function(art, opts) {};

  /**
    * Create a new actor that will be automatically updated each tick
    * @func scene.addActor
    * @arg {art} art
    * @arg {Object} [opts] contains options to be applied to the underlying {@link Actor}
    * @returns {View}
    */
  this.addActor = function(art, opts) {};

  /**
    * Set the x and y coordinates in screen space for the score text. The score text remains invisible until this function is called.
    * @func scene.showScore
    * @arg {number} x
    * @arg {number} y
    * @arg {Object} [opts] contains options to be applied to the underlying {@link View}
    */
  this.showScore = function(x, y, opts) {};

  /**
    * Called when a collision occurs
    * @callback onCollisionCallback
    * @arg {Actor} a
    * @arg {Actor} b
    */
  /**
    * This collision check will be run each tick
    * @func scene.onCollision
    * @arg {Actor|Group|array} a
    * @arg {Actor|Group|array} b
    * @arg {onCollisionCallback} callback
    */
  this.onCollision = function(a, b, callback) {};

  /**
    * Called when a touch occurs
    * @callback onTouchCallback
    * @arg {number} x
    * @arg {number} y
    */
  /**
    * Register a new touch callback
    * @func scene.onTouch
    * @arg {onTouchCallback} callback
    */
  this.onTouch = function(callback) {};

  /**
    * Called every tick with accellerometer data
    * @callback onAccelerometerCallback
    * @arg {AccellerometerEvent} e
    */
  /**
    * Register a new accelerometer callback
    * @func scene.onAccelerometer
    * @arg {onAccelerometerCallback} callback
    */
  this.onAccelerometer = function(callback) {};

  /**
    * Called every tick with accellerometer data
    * @callback onTickCallback
    * @arg {number} [dt] - Used to normalise game speed based on real time
    */
  /**
    * Register a new tick handler
    * @func scene.onTick
    * @arg {onTickCallback} callback
    */
  this.onTick = function(dt) {};

};
