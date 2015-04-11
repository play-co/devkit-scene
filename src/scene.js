
/**
 * Construct the main scene for the game, this is where all of the gameplay is defined.
 * @namespace scene
 * @arg {function} - The function which will initialize a new game scene
 */
var scene = function(newGameFunc) {

  /**
    * @var {Screen} scene.screen
    */
  this.screen = null;

  /**
    * @var {Camera} scene.cam
    */
  this.cam = null;

  /**
    * There can be only one player. {@link scene.gameOver} is automatically called when the player is destroyed.
    * @var {Actor} scene.player
    */
  this.player = null;

  /** Use the get and set method
    * @var {number} scene._score
    * @see scene.getScore
    * @see scene.setScore */
  this._score = 0;

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
    * @arg {Object} [opts] - contains options to be applied to the underlying {@link View}
    * @returns {View}
    */
  this.addBackground = function(art, opts) {};

  /**
    * Create a new actor that will be automatically updated each tick
    * @func scene.addActor
    * @arg {art} art
    * @arg {Object} [opts] - contains options to be applied to the underlying {@link Actor}
    * @returns {View}
    */
  this.addActor = function(art, opts) {};

  /**
    * Sets the scene player, makes sure not to override an existing player.
    * @func scene.addPlayer
    *
    * @see scene.addActor
    * @arg {art} art
    * @arg {Object} [opts] - contains options to be applied to the underlying {@link Actor}
    * @returns {View} - The newly set player
    */
  this.addPlayer = function(art, opts) {};

  /**
    * Add a new spawner
    * @func scene.addSpawner
    * @arg {Spawner} spawner
    * @returns {@link Spawner}
    */
  this.addSpawner = function(spawner) {};

  /**
    * Set the x and y coordinates in screen space for the score text. The score text remains invisible until this function is called.
    * @func scene.showScore
    * @arg {number} x
    * @arg {number} y
    * @arg {Object} [opts] contains options to be applied to the underlying {@link View}
    */
  this.showScore = function(x, y, opts) {};

  /**
    * Calling this function will set {@link scene._score} and update the score view.
    * @func scene.setScore
    * @arg {number} newScore
    */
  this.setScore = function(newScore) {};

  /** @func scene.getScore
    * @returns {number} */
  this.getScore = function() {};

  /**
    * @func scene.addScore
    * @see scene.setScore
    * @arg {number} amount
    */
  this.addScore = function(amount) {};

  /**
    * Called when a collision occurs
    * @callback onCollisionCallback
    * @arg {Actor} a
    * @arg {Actor} b
    */
  /**
    * This collision check will be run each tick. {@link callback} will be called only once per tick
    * @func scene.onCollision
    * @arg {Actor|Actor[]|Group} a
    * @arg {Actor|Actor[]|Group} b
    * @arg {onCollisionCallback} callback
    * @arg {boolean} [allCollisions] - {@link callback} may be called more than once per tick
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
