import device;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.ScoreView as ScoreView;
import .ui.BaseView as BaseView;

import accelerometer;

import entities.shapes.Line as Line;
import entities.shapes.Rect as Rect;

import .state.StateManager as StateManager;

import .timer.TimerManager as TimerManager;
import .timer.Timer as Timer;

import .group.Group as Group;
import .ui.Screen as Screen;
import .camera.Camera as Camera;
import .ui.Background as Background;
import .utils;
import .ui.ScaleManager as ScaleManager;
import .ui.UIView as UIView;
import .ui.SceneImageView as SceneImageView;

import communityart;
import effects;

// Default values

// Variables that are private to this file
var _modes = {}

/** Use the get and set method
 * @var {number} scene._score
 * @private
 * @see scene.getScore
 * @see scene.setScore */
var _score = 0;
var _using_score = false;

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
          scene.addText('Game Over!', { y: bgHeight / 2 - scene.text.DEFAULT_TEXT_HEIGHT });
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

// --- ---- Shortcuts ---- ---- //

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
 * Reset and restart the entire game.
 * @method scene.reset
 */
scene.reset = function() {
  GC.app.reset();
};

/////////////////////////////////////////////////
/////////////////////////////////////////////////

var SCENE_MODULES = [
  jsio('import .animation'),
  jsio('import .collision'),
  jsio('import .actor'),
  jsio('import .group'),
  jsio('import .camera'),
  jsio('import .ui'),
  jsio('import .spawner'),
  jsio('import .audio'),
  jsio('import .weeby'),
];

var VERBOSE = true;
scene.log = function() {
  if (VERBOSE) {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('[scene]')
    console.log.apply(console, args);
  }
};
scene.warn = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('[scene]')
  console.warn.apply(console, args);
};
scene.log('Logging now ready');

var registerModule = function(module, parentObj, parentChain) {
  parentObj = parentObj || scene;
  parentChain = parentChain || ['scene'];

  for (var key in module) {
    var chain = parentChain.concat([key]);

    // if exists and is function
    if (parentObj[key]) {
      if (typeof parentObj[key] === 'object') {
        // try to merge the objects
        registerModule(module[key], parentObj[key], chain);
      } else {
        scene.warn('[scene] Module export collision: ', typeof module[key], chain.join('.'), module[key]);
      }
      continue;
    }

    scene.log('Adding ' + chain.join('.'));
    parentObj[key] = module[key];
  }
}
SCENE_MODULES.forEach(function(module) {
  registerModule(module);
});

exports = scene;
