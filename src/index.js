import device;
import animate;
import animate.transitions as transitions;

import ui.View as View;
import ui.TextView as TextView;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.ScoreView as ScoreView;
import .BaseView;

import accelerometer;

import .spawner.HorizontalSpawner as HorizontalSpawner;
import .spawner.VerticalSpawner as VerticalSpawner;
import .spawner.Spawner as Spawner;

import entities.shapes.Line as Line;
import entities.shapes.Rect as Rect;

import .state.StateManager as StateManager;

import .collision.CollisionManager as CollisionManager;
import .collision.CollisionChecker as CollisionChecker;

import .timer.TimerManager as TimerManager;
import .timer.Timer as Timer;

import .Actor;
import .SATActor;

import .Group;
import .Screen;
import .Camera;
import .Background;
import .SceneText;
import .utils;
import .SceneAudioManager;
import .ScaleManager;
import .ui.UIView as UIView;
import .ui.SceneImageView as SceneImageView;
import .ui.SceneScoreView as SceneScoreView;

import communityart;
import effects;

// Default values
/** @type {Number} scene.DEFAULT_TEXT_WIDTH
 * @private
 * @default 350 */
var DEFAULT_TEXT_WIDTH  = 350;
/** @type {Number} scene.DEFAULT_TEXT_HEIGHT
 * @private
 * @default 75 */
var DEFAULT_TEXT_HEIGHT = 75;

// Variables that are private to this file
var _modes = {}

/** Use the get and set method
 * @var {number} scene._score
 * @private
 * @see scene.getScore
 * @see scene.setScore */
var _score = 0;
var _using_score = false;

/** @type {String} scene._text_color
 * @private
 * @default '#FFF'
 * @see scene.setTextColor
 */
var _text_color = '#FFF';
/** @type {String} scene._text_font
 * @private
 * @default 'Arial'
 * @see scene.setTextFont
 */
var _text_font = 'Arial';

var _game_running = false;
var _on_tick = null;

/**
 * Construct the main scene for the game, this is where all of the gameplay is defined.
 * @namespace scene
 * @version 0.0.3
 * @arg {function} - The function which will initialize a new game scene
 */
scene = function (newGameFunc) {

  scene.mode('default', newGameFunc);

  scene._app = Class(GC.Application, function() {
    /**
     * initUI
     */
    this.initUI = function() {
      this.rootView = this.view;

      /**
        * The devkit {@link View} which contains the entire scene.
        * @var {View} scene.view
        */
      scene.view = this.rootView;

      scene.updateScreenDimensions();

      /**
        * The devkit {@link View} which all backgrounds should be added to.
        * @var {Background} scene.background
        */
      scene.background = new Background({
        parent: this.rootView,
        width: scene.screen.width,
        height: scene.screen.height
      });

      /**
        * The devkit {@link View} which all actors should be added to.
        * @var {View} scene.stage
        */
      this.stage = new BaseView({
        parent: scene.view,
        infinite: true
      });
      scene.stage = this.stage;

      /**
        * @method scene.addImage
        * @see BaseView#addImage
        */
      scene.addImage = bind(scene.stage, scene.stage.addImage);

      /**
       * The devkit {@link View} which all UI should be added to.
       * @var {UIView} scene.ui
       */
      scene.ui = new UIView({
        superview: scene.view,
        infinite: true
      });

      /**
       * The default group for actors (if no other group is used).
       * @var {Group} scene.group
       */
      scene.group = new Group({superview: this.stage});

      /**
       * The devkit {@link View} which all text should be added to.
       * @var {View} scene.textContainer
       */
      scene.textContainer = new View({
        parent: this.rootView,
        width:  scene.screen.width,
        height: scene.screen.height,
        blockEvents: true,
        zIndex: 100000
      });

      /**
       * An empty devkit {@link View} which is overtop of the entire game, used to catch input.
       * @var {View} scene._inputOverlay
       */
      scene._inputOverlay = new View({ parent: this.rootView, infinite: true, zIndex: 999999 });
      var touchManager = scene.screen.touchManager;
      scene._inputOverlay.onInputStart = bind(touchManager, touchManager.downHandler);
      scene._inputOverlay.onInputSelect = bind(touchManager, touchManager.upHandler);
      scene._inputOverlay.onInputMove = bind(touchManager, touchManager.moveHandler);

      /**
       * The default manager for scene timers. Add timers to this if you want them automatically managed.
       * @var {TimerManager} scene.timerManager
       */
      scene.timerManager = new TimerManager();
    }

    this.launchUI = function() {
      this.startGame();
    }

    /**
     * startGame
     */
    this.startGame = function() {
      // show the splash screen
      if (_modes.splash) {
        this.reset('splash');

        // start the game when you click
        scene.screen.onDown(function() {
          this.reset('default');
        }.bind(this), true);
      } else {
        this.reset();
      }
    }

    /**
     * reset
     */
    this.reset = function(mode) {
      if (mode === undefined) mode = 'default';

      scene.ui.reset();

      effects.commit();
      effects.stop();
      scene.clearAnimations();
      scene.updateScreenDimensions();
      scene.screen.reset();
      scene.background.reset();

      scene.group.destroy(false);
      scene.player = null;
      scene.camera.stopFollowing();
      scene.camera.x = 0;
      scene.camera.y = 0;

      scene.totalDt = 0;
      scene.timerManager.reset();

      for (var i in scene.groups) {
        scene.groups[i].destroy(false);
      }

      for (var k in scene.extraViews) {
        scene.extraViews[k].removeFromSuperview();
      }

      delete scene._scoreView;
      scene.background.destroy();

      scene.collisions.reset();

      scene.stage.removeAllSubviews();

      // Clear the tallies
      scene.extraViews = [];
      scene.groups = [];
      _score = 0;
      _on_tick = null;

      scene.state.reset();

      // Let's reboot the fun!
      var currentMode = _modes[mode]
      currentMode.fun(scene.state._gameObject, currentMode.opts);

      scene.background.reloadConfig();

      // The curtain rises, and Act 1 begins!
      _game_running = true;
    }

    /**
     * tick tock
     */
    this.tick = function(dt) {
      if (_on_tick) {
        _on_tick(dt);
      }

      scene.totalDt += dt;
      scene.totaApplDt += dt;

      scene.timerManager.update(dt);

      // Convert dt into seconds
      dt /= 1000;

      scene.collisions.update();
      scene.background.update(dt);
      scene.group.update(dt);
      for (var i = 0; i < scene.groups.length; i++) {
        scene.groups[i].update(dt);
      }
      scene.camera.update(dt);
      this.stage.style.x = -scene.camera.x;
      this.stage.style.y = -scene.camera.y;
      if (scene.camera.following) {
        scene.background.scrollTo(-scene.camera.x, -scene.camera.y);
      }
    }
  });

  return scene._app;

};

/**
 * Easy access to {@link ScaleManager.SCALE_MODE}
 * @var {Object} scene.SCALE_MODE
 */
scene.SCALE_MODE = ScaleManager.SCALE_MODE;
/**
 * The scene scale manager is responsible for automatically fitting your game to any resolution in a reasonable way.
 * The default width and height are 576 and 1024 respectively.
 * The defualt scale mode is {@link ScaleManager.SCALE_MODE.LOCK_HEIGHT}
 * @type {ScaleManager} scene.scaleManager
 */
scene.scaleManager = new ScaleManager(576, 1024, scene.SCALE_MODE.LOCK_HEIGHT);

/**
 * Update the scaleManager as well as the scene screen dimensions.
 * @method scene.setScaleOptions
 * @param  {Number} width
 * @param  {Number} height
 * @param  {String} scaleMode
 * @see ScaleManager#resize
 * @see scene.updateScreenDimensions
 */
scene.setScaleOptions = function(width, height, scaleMode) {
  scene.scaleManager.resize(width, height, scaleMode);
  scene.updateScreenDimensions();
};

/**
 * This automatically updates the internal scene variables relying on the scaleManager sizes
 * @method scene.updateScreenDimensions
 */
scene.updateScreenDimensions = function() {

  scene.camera.resize(scene.scaleManager.width, scene.scaleManager.height);
  scene.screen.width = scene.scaleManager.width;
  scene.screen.height = scene.scaleManager.height;

  if (!scene.view) { return; }

  scene.scaleManager.scaleView(scene.view);

  var vs = scene.view.style;
  vs.x = (device.width - vs.width) / 2;
  vs.y = (device.height - vs.height) / 2;
  vs.anchorX = vs.width / 2;
  vs.anchorY = vs.height / 2;
};

/**
 * The screen object is the rectangle where all UI lives.  Its dimensions match that of the device screen.
 * Default size is 576 x 1024
 * @var {Screen} scene.screen
 */
scene.screen = new Screen(576, 1024);

/**
 * The scene camera is useful for following around an Actor. The camera can be
 * thought of as the rectangular region of world space that is currently visible to the user.
 * Default size is 576 x 1024
 * @var {Camera} scene.cam
 */
scene.camera = new Camera(scene.screen.width, scene.screen.height);

/**
 * The collision manager is responsible for tracking all scene collisions.
 * @var {CollisionManager} scene.collisions
 * @see scene.onCollision
 */
scene.collisions = new CollisionManager();

/**
 * The state manager is what handles changing game states.
 * @var {StateManager} scene.state
 */
scene.state = new StateManager();

/**
 * There can be only one player. {@link scene.gameOver} is automatically called when the player is destroyed.
 * @var {Actor} scene.player
 * @see scene.addPlayer
 */
scene.player = null;

/**
 * The total number of milliseconds that have elapsed since the start of the game.
 * @var {number} scene.totalDt
 */
scene.totalDt = 0;

/**
 * The total number of milliseconds that have elapsed since the start of the app.
 * @var {number} scene.totalAppDt
 */
scene.totalAppDt = 0;

/**
 * Called every tick with the dt in milliseconds since the last tick.
 * @callback onTickCallback
 * @arg {number} [dt] - Used to normalise game speed based on real time
 */
/**
 * Register a new tick handler
 * @func scene.onTick
 * @arg {onTickCallback} callback
 */
scene.onTick = function(cb) {
  _on_tick = cb;
};

// ---- ---- Accelerometer ---- ---- //

/**
 * @var {Boolean} scene._accelerometerStarted
 */
scene._accelerometerStarted = false;
/**
 * @var {Boolean} scene._accelerometerHandlers
 */
scene._accelerometerHandlers = [];

/**
 * @typedef {Object} AccellerometerData
 * @property {Number} x
 * @property {Number} y
 * @property {Number} z
 * @property {Number} forwardTilt
 * @property {Number} tilt
 * @property {Number} twist
 */
/**
 * Called every tick with accellerometer data
 * @callback onAccelerometerCallback
 * @arg {AccellerometerData} e
 */
/**
 * Register a new accelerometer callback
 * @func scene.onAccelerometer
 * @arg {onAccelerometerCallback} callback
 */
scene.onAccelerometer = function(cb) {
  if (!scene._accelerometerStarted) {
    scene._accelerometerStarted = true;
    scene._accelerometerHandlers = [];

    accelerometer.on('devicemotion', function (evt) {

      var x = (evt.accelerationIncludingGravity.x - evt.acceleration.x) / 10;
      var y = (evt.accelerationIncludingGravity.y - evt.acceleration.y) / 10;
      var z = (evt.accelerationIncludingGravity.z - evt.acceleration.z) / 10;

      var accelObj = {
        x: x,
        y: y,
        z: z,
        forwardTilt: Math.atan2(z, y),
        tilt: Math.atan2(x, y),
        twist: Math.atan2(x, z),
      };

      // Update all the handlers!
      var accelCallbacks = scene._accelerometerHandlers;
      for (var i = 0; i < accelCallbacks.length; ++i) {
        accelCallbacks[i](accelObj);
      }
    });
  }

  scene._accelerometerHandlers.push(cb);
};

/**
 * Stop and clear accelerometer handlers.
 * @method scene.stopAccelerometer
 */
scene.stopAccelerometer = function() {
  if (scene._accelerometerStarted) {
    accelerometer.stop();
    scene._accelerometerStarted = false;
  }
};

// ---- ---- //

/**
 * Displays text
 * @func scene.addText
 * @arg {string} text
 * @arg {Object} [opts] - contains options to be applied to {@link TextView}
 * @returns {TextView}
 */
/**
 * @func scene.addText(2)
 * @arg {string} text
 * @arg {number} x
 * @arg {number} y
 * @arg {Object} [opts] - contains options to be applied to {@link SceneText}
 * @returns {SceneText}
 */
scene.addText = function(text, x, y, opts) {
  opts = opts || {};

  if (typeof x === 'object') {
    // Function type 1
    opts = x;
  } else if (typeof x === 'number' && typeof y === 'number') {
    // Function type 2
    opts.x = opts.x !== undefined ? opts.x : x;
    opts.y = opts.y !== undefined ? opts.y : y;
  }

  opts = merge(opts, {
    superview: scene.textContainer,
    text: text,
    x: (scene.textContainer.style.width - DEFAULT_TEXT_WIDTH) / 2,
    y: (scene.textContainer.style.height - DEFAULT_TEXT_HEIGHT) / 2,
    color: _text_color,
    fontFamily: _text_font,
    // FIXME: opts.center, because width and height might be different
    anchorX: DEFAULT_TEXT_WIDTH / 2,
    anchorY: DEFAULT_TEXT_HEIGHT / 2,
    width: DEFAULT_TEXT_WIDTH,
    height: DEFAULT_TEXT_HEIGHT
  });

  var result = new SceneText(opts);
  scene.extraViews.push(result);
  return result;
};

/**
 * Remove a text view from the scene.
 * @method scene.removeText
 * @param  {SceneText} sceneText - The instance to be removed
 */
scene.removeText = function(sceneText) {
  var extraViews = scene.extraViews;
  var index = extraViews.indexOf(sceneText);
  if (index !== -1) {
    sceneText.removeFromSuperview();
    var lastView = extraViews.pop();
    if (index < extraViews.length) {
      extraViews[index] = lastView;
    }
  }
};

/**
 * Set the default text color to be applied to any new text view created using {@link scene.addText}
 * @method scene.setTextColor
 * @param  {String} color
 */
scene.setTextColor = function(color) {
  // TODO validate?
  _text_color = color;
};

/**
 * Set the default text font to be applied to any new text view created using {@link scene.addText}
 * @method scene.setTextFont
 * @param  {String} font
 */
scene.setTextFont = function(font) {
  // TODO validate?
  _text_font = font;
};

/**
 * Set the x and y coordinates in screen space for the score text. The score text remains invisible
 * until this function is called.
 * @method  scene.showScore
 * @param   {Number} x
 * @param   {Number} y
 * @param   {Object} [opts] contains options to be applied to the underlying {@link View}
 * @param   {String} [opts.color]
 * @param   {String} [opts.font]
 * @returns {TextView}
 */
/**
 * If a resource is specified, a {@link ScoreView} will be used (because they look great).
 * @method scene.showScore(2)
 * @param   {String|Object} resource - resource key to be resolved by community art, or opts
 * @param   {Number}        x
 * @param   {Number}        y
 * @param   {Object}        [opts]
 * @returns {SceneScoreView}
 */
scene.showScore = function(resource, x, y, opts) {
  var scoreView;

  // function type (1)
  if (typeof resource === 'number') {
    opts = y;
    y = x;
    x = resource;

    // Update the old view
    if (scene._scoreView) {
      scene._scoreView.style.x = x;
      scene._scoreView.style.y = y;
      opts && scene._scoreView.updateOpts(opts);
      return scene._scoreView;
    }

    // Make a new TextView
    opts = opts || {};
    opts.font = opts.font || _text_font;
    opts.color = opts.color || _text_color;
    opts.superview = opts.superview || scene.textContainer;

    scoreView = new TextView(combine({
      x: x,
      y: y,
      width: 200,
      height: 75,
      fontFamily: opts.font,
      text: scene.getScore(),
      horizontalAlign: 'left',
    }, opts));
  }
  // function type (2)
  else {
    // Make a new ScoreView
    var resourceOpts = communityart.getConfig(resource, 'ScoreView');
    opts = opts || {};

    opts.superview = opts.superview || scene.textContainer;
    opts.x = x;
    opts.y = y;
    opts.format = opts.format || SceneScoreView.FORMAT_SCORE;

    var viewOpts = merge(opts, resourceOpts);
    scoreView = new SceneScoreView(viewOpts);
  }

  scene.extraViews.push(scoreView);
  scene._scoreView = scoreView;
  return scoreView;
};

/**
 * Calling this function will set {@link scene._score} and update the score view.
 * @func scene.setScore
 * @arg {number} newScore
 */
scene.setScore = function(score) {
  if (_game_running) {
    _score = score;
    _using_score = true;
    if (scene._scoreView) {
      scene._scoreView.setText('' + score);
    }
  }
};

/**
 * @func scene.addScore
 * @arg {number} amount
 * @see scene.setScore
 */
scene.addScore = function(add) {
  scene.setScore(scene.getScore() + add);
};

/**
 * @func scene.getScore
 * @returns {number}
 */
scene.getScore = function() {
  _using_score = true;
  return _score;
};

/**
 * Execute a callback every specified amount of milliseconds. Game dt will be used
 * to determine how long has passed, not system time. Replacement for `setInterval`.
 * @func scene.addInterval
 * @arg {function} callback
 * @arg {number} ms - milliseconds between callback executions
 * @returns {Timer} intervalInstance
 */
scene.addInterval = function(callback, ms) {
  return this.timerManager.addTimer(new Timer(callback, ms, false));
};

/**
 * Remove an interval before it has executed. Replacement for `clearInterval`.
 * @func scene.removeInterval
 * @arg {Timer} intervalInstance
 */
scene.removeInterval = function(intervalInstance) {
  return this.timerManager.removeTimer(intervalInstance);
};

/**
 * Execute a callback after a specified amount of milliseconds. Callback will only execute once.
 * Game dt will be used to determine how long has passed, not system time. Replacement for `setTimeout`.
 * @func scene.addTimeout
 * @arg {function} callback
 * @arg {number}   ms - milliseconds until callback is executed
 * @returns {Timer} timeoutInstance
 */
scene.addTimeout = function(callback, ms) {
  return this.timerManager.addTimer(new Timer(callback, ms, true));
};

/**
 * Remove a timeout before it has executed. Replacement for `clearTimeout`.
 * @func scene.removeTimeout
 * @arg {Timer} timeoutInstance
 */
scene.removeTimeout = function(timeoutInstance) {
  return this.timerManager.removeTimer(timeoutInstance);
};

/**
 * When called, this function will restart the game.
 * If scene has been set to use Weeby, calling this will return the user to the Weeby UI.
 * @func scene.gameOver
 * @arg {Object}  [opts]
 * @arg {number}  [opts.delay] - A delay between when this function is called and when the endgame logic is run.
 * @arg {boolean} [opts.noGameoverScreen] - Optionally skip the "Game Over" text.
 */
scene.gameOver = function(opts) {

  if (_game_running === false ) { return; }

  opts = opts || {};
  opts.delay = opts.delay !== undefined ? opts.delay : 1000;

  _game_running = false;

  setTimeout(function () {
    if (scene._useWeeby) {
      weeby.finishGame({ score: scene.getScore() });
    } else {
      if (!opts.noGameoverScreen) {
        var bgHeight = scene.screen.height;

        // TODO: This should be a scene splash ... not random text. Allows the player to set their own game over splash.
        if (_using_score) {
          scene.addText('Game Over!', { y: bgHeight / 2 - DEFAULT_TEXT_HEIGHT });
          scene.addText('Score: ' + _score, { y: bgHeight / 2 + 10 });
        } else {
          scene.addText('Game Over!');
        }

        scene.screen.onDown(function () {
          setTimeout(function () { GC.app.reset() });
        }, true);
      }
    }
  }, opts.delay);

};

/**
 * Set a mode to the given function
 * @method scene.mode
 * @param {String} name - The name of the mode to set
 * @param {function} resetFunction - The function to call from reset, whenever the mode resets or begins
 * @param {Object} [opts] - Options to pass to the mode function
 */
/**
 * Switches to the given mode
 * @method scene.mode(2)
 * @param {String} name - The name of the mode to switch to
 */
scene.mode = function(name, fun, opts) {
  if (fun !== undefined) {
    // Set a mode to a function
    opts = opts || {};
    _modes[name] = {
      fun: fun,
      opts: opts
    };
  } else {
    // Change to the given mode
    GC.app.reset(name);
  }
};

/**
 * Construct a splash screen to show at the beginning of the game, click once anywhere to hide the screen.
 * @func scene.splash
 * @arg {function} func
 */
scene.splash = function(fun, opts) {
  // TODO: Check for an existing splash screen?
  // TODO: How does it know that clicking once goes to the game? Should be more configurable here and not hardcoded
  scene.mode('splash', fun, opts);
};

/**
 * Add a background layer to your game.
 * @method scene.addBackground
 * @param  {Object} resource
 * @param  {Object} [opts]
 */
scene.addBackground = function(art, opts) {
  return scene.background.addLayer(art, opts);
};

/**
 * Change the default class for actors
 * @method scene.setActorCtor
 * @param  {Class} actorCtor
 */
scene.setActorCtor = function(actorCtor) {
  scene._actorCtor = actorCtor;
};

/**
 * Create a new actor that will be automatically updated each tick
 * @method  scene.addActor
 * @param   {String|Object} resource - resource key to be resolved by community art, or opts
 * @param   {Object}        [opts]   - contains options to be applied to the underlying {@link Actor}
 * @returns {Actor}
 */
/**
 * @method  scene.addActor(2)
 * @param   {View}   view
 * @param   {Object} [opts] - contains options to be applied to the underlying {@link Actor}
 * @returns {Actor}
 */
scene.addActor = function(resource, opts) {
  return scene.group.addActor(resource, opts);
};

/**
 * Sets the scene player, makes sure not to override an existing player.
 * @method  scene.addPlayer
 * @param   {String|Object} resource - resource key to be resolved by community art, or opts
 * @param   {Object}        [opts]   - contains options to be applied to the underlying {@link Actor}
 * @returns {View}                   - The newly set player
 * @see scene.addActor
 */
scene.addPlayer = function(resource, opts) {
  if (scene.player) {
    throw new Error('You can only add one player!');
  }

  scene.player = scene.addActor(resource, opts);
  scene.player.onDestroy(function() {
    scene.gameOver();
  });
  return scene.player;
};

/**
 * Add a new actor group to scene tracking
 * @func    scene.addGroup
 * @arg     {Object} [opts]
 * @returns {Group}
 */
scene.addGroup = function(opts) {
  opts = opts || {};
  opts.superview = GC.app.stage;
  var result = new Group(opts);
  scene.groups.push(result);
  return result;
};

/**
 * Will add a new spawner to the scene default group.
 * @arg     {Spawner} spawner
 * @returns {Spawner}
 * @see     {Group#addSpawner}
 */
scene.addSpawner = function(spawner) {
  return scene.group.addSpawner(spawner);
};

/**
 * Will remove a spawner from the scene default group.
 * @arg     {Spawner} spawner
 * @returns {Spawner}
 * @see     {Group#removeSpawner}
 */
scene.removeSpawner = function(spawner) {
  return scene.group.removeSpawner(spawner);
};

/**
 * This collision check will be run each tick. The callback will be called only once per tick by default.
 * @func scene.onCollision
 * @arg {Actor|Actor[]|Group|Collidable} a
 * @arg {Actor|Actor[]|Group|Collidable} b
 * @arg {onCollisionCallback}            callback
 * @arg {boolean}                        [allCollisions] - {@link callback} may be called more than once per tick
 * @returns {number} collisionCheckID
 * @see CollisionChecker
 */
scene.onCollision = function(a, b, callback, allCollisions) {
  // create a new collision checker
  var check = new CollisionChecker({
    a: a,
    b: b,
    callback: callback,
    allCollisions: allCollisions
  });

  return this.collisions.registerCollision(check);
};

// --- ---- Shortcuts ---- ---- //

/**
 * Easy access to actor classes
 * @var      {Object}   scene.actor
 * @property {Actor}    scene.actor.Actor
 * @property {SATActor} scene.actor.SAT
 */
scene.actor = {
  Actor: Actor,
  SAT: SATActor
}
scene._actorCtor = scene.actor.Actor;

/**
 * Easy access to spawner classes
 * @var  {Object}     scene.spawner
 * @prop {Timed}      scene.spawner.Spawner
 * @prop {Horizontal} scene.spawner.Horizontal
 * @prop {Vertical}   scene.spawner.Vertical
 */
scene.spawner = {
  Horizontal: HorizontalSpawner,
  Vertical: VerticalSpawner,
  Timed: Spawner
};

/**
 * Easy access to shape classes
 * @var  {Object} scene.shape
 * @prop {Rect}   scene.shape.Rect
 * @prop {Line}   scene.shape.Line
 */
scene.shape = {
  Rect: Rect,
  Line: Line
};

/**
 * Easy access to collision classes
 * @var  {Object}             scene.collision
 * @prop {CollisionChecker}   scene.collision.CollisionChecker
 */
scene.collision = {
  CollisionChecker: CollisionChecker
};

/**
 * @var {String[]} scene.animationGroups - Animation groups to be tracked and auto cleaned up by scene
 * @default ['scene']
 */
// TODO: seems like this calls for ... another manager!
scene.animationGroups = null;

/**
 * Clear all the tracked animation groups
 * @method scene.clearAnimations
 */
scene.clearAnimations = function() {
  if (scene.animationGroups) {
    // Clear old animaion groups
    for (var i = 0; i < scene.animationGroups.length; i++) {
      var group = animate.getGroup(scene.animationGroups[i]);
      if (!group) { continue; }
      var animations = group._anims;
      for (var key in animations) {
        animations[key].commit();
        animations[key].clear();
        delete animations[key];
      }
    }
  }

  // Reset array
  scene.animationGroups = ['scene'];
};

/**
 * @func scene.animate
 * @arg {View}         subject
 * @arg {string}       [groupName]
 * @returns {Animator} anim
 */
scene.animate = function(subject, groupId) {
  groupId = groupId === undefined ? "scene" : "scene_" + groupId;
  var anim = animate(subject, groupId);
  if (groupId !== "scene" && scene.animationGroups.indexOf(groupId) === -1) {
    scene.animationGroups.push(groupId);
  }
  return anim;
};

/**
 * Easy access to {@link animate.transitions}
 * @todo Document animate
 */
scene.transitions = transitions;

// ---- ---- Audio --- ---- //

/**
 * The default scene audio manager. Used to register your games sounds and music.
 * @var {SceneAudioManager} scene.audio
 */
scene.audio = new SceneAudioManager();
/**
 * Add a new sound effect to your game.
 * @method scene.addSound
 * @see SceneAudioManager#addSound
 */
scene.addSound = bind(scene.audio, 'addSound');
/**
 * @todo Idk what a sound group is
 * @method scene.addSoundGroup
 * @see SceneAudioManager#addSoundGroup
 */
scene.addSoundGroup = bind(scene.audio, 'addSoundGroup');
/**
 * Add a new background music track to your game.
 * @method scene.addMusic
 * @see SceneAudioManager#addMusic
 */
scene.addMusic = bind(scene.audio, 'addMusic');
/**
 * Play a registered sound.
 * @method scene.playSound
 * @see SceneAudioManager#playSound
 */
scene.playSound = bind(scene.audio, 'playSound');
/**
 * Play a registered music track.
 * @method scene.playMusic
 * @see SceneAudioManager#playMusic
 */
scene.playMusic = bind(scene.audio, 'playMusic');
/**
 * Stop a playing music track.
 * @method scene.stopMusic
 * @see SceneAudioManager#stopMusic
 */
scene.stopMusic = bind(scene.audio, 'stopMusic');

/**
 * Reset and restart the entire game.
 * @method scene.reset
 */
scene.reset = function() {
  GC.app.reset();
};

/**
 * Whether or not the game will be using an included Weeby loop
 * @var {Boolean} scene._useWeeby
 */
// TODO: This is a bit of a hack, make it better
scene._useWeeby = false;
/**
 * Use a Weeby loop!
 * Warning: Requires access to a Weeby bundle.
 * @method scene.useWeeby
 */
scene.useWeeby = function() {
  import device;
  import weeby;
  import ui.View;

  var _gameView;
  function getGameView() {
    return _gameView || (_gameView = weeby.createGameView(GC.app));
  }

  scene.mode('weeby', function () {
    weeby.launchUI();
    weeby.onStartGame = function (data) {
      // TODO: This is temporary until the state manager / reset funcitonality get refactored
      //         to include an opts object.  The reset logic currently is very dirty
      scene.weebyData = data;
      scene.mode('default');
    };
  });

  GC.on('app', function () {
    scene.mode('weeby');
  });

  Object.defineProperty(scene._app.prototype, 'rootView', { get: getGameView });

  scene._useWeeby = true;
};

exports = scene;
