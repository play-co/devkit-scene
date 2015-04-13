// import shape.Shape as Shape;
// import shape.Rect as Rect;
// import shape.Line as Line;

// import spawner.Spawner as Spawner;
// import spawner.HorizontalSpawner as HorizontalSpawner;
// import spawner.VerticalSpawner as VerticalSpawner;

// import collision.CollisionManager as CollisionManager;

/**
 * Construct the main scene for the game, this is where all of the gameplay is defined.
 * @namespace scene
 * @version 0.0.2
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
    * @var {CollisionManager} scene.collision
    */
  this.collision = null;

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

  /** Easy access to shape classes
    * @var {Object} scene.shape
    * @prop {Shape} scene.shape.Shape
    * @prop {Rect} scene.shape.Rect
    * @prop {Line} scene.shape.Line */
  this.shape = {
    Shape: Shape,
    Rect: Rect,
    Line: Line
  };

  /** Easy access to spawner classes
    * @var {Object} scene.spawner
    * @prop {Spawner} scene.spawner.Spawner
    * @prop {HorizontalSpawner} scene.spawner.Horizontal
    * @prop {VerticalSpawner} scene.spawner.Vertical */
  this.Spawner = {
    Spawner: Spawner,
    Horizontal: HorizontalSpawner,
    Vertical: VerticalSpawner
  };

  /** The total number of milliseconds that have elapsed since the start of the game.
    * @var {number} scene.totalDt */
  this.totalDt = 0;

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
    * @arg {ParallaxView} view
    * @arg {Object} [opts] - contains options to be applied to the underlying {@link ParallaxView}
    * @returns {View}
    */
  this.addBackground = function(view, opts) {};

  /**
    * Create a new actor that will be automatically updated each tick
    * @func scene.addActor
    * @arg {View} view
    * @arg {Object} [opts] - contains options to be applied to the underlying {@link Actor}
    * @returns {View}
    */
  /**
    * @func scene.addActor(2)
    * @arg {View} view
    * @arg {number} x
    * @arg {number} y
    * @arg {Object} [opts] - contains options to be applied to the underlying {@link Actor}
    * @returns {View}
    */
  this.addActor = function(view, x, y, opts) {};

  /**
    * Sets the scene player, makes sure not to override an existing player.
    * @func scene.addPlayer
    *
    * @see scene.addActor
    * @arg {View} view
    * @arg {Object} [opts] - contains options to be applied to the underlying {@link Actor}
    * @returns {View} - The newly set player
    */
  this.addPlayer = function(view, opts) {};

  /**
    * Add a new group
    * @func scene.addGroup
    * @arg {Object} [opts]
    * @returns {@link Group}
    */
  this.addGroup = function(opts) {};

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
    * Execute a callback every specified amount of milliseconds. Game dt will be used
    * to determine how long has passed, not system time. Replacement for `setInterval`.
    * @func scene.addInterval
    * @arg {function} callback
    * @arg {number} ms - milliseconds between callback executions
    * @returns {number} intervalID
    */
  this.addInterval = function(callback, ms) {};

  /**
    * Remove an interval before it has executed. Replacement for `clearInterval`.
    * @func scene.removeInterval
    * @arg {number} intervalID
    */
  this.removeInterval = function(intervalID) {};

  /**
    * Execute a callback after a specified amount of milliseconds. Callback will only execute once.
    * Game dt will be used to determine how long has passed, not system time. Replacement for `setTimeout`.
    * @func scene.addTimeout
    * @arg {function} callback
    * @arg {number} ms - milliseconds until callback is executed
    * @returns {number} timeoutID
    */
  this.addTimeout = function(callback, ms) {};

  /**
    * Remove a timeout before it has executed. Replacement for `clearTimeout`.
    * @func scene.removeTimeout
    * @arg {number} timeoutID
    */
  this.removeTimeout = function(timeoutID) {};

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
