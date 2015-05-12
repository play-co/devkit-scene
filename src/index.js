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
var DEFAULT_TEXT_WIDTH  = 350;
var DEFAULT_TEXT_HEIGHT = 75;
var DEFAULT_TEXT_COLOR  = '#FFF';
var DEFAULT_TEXT_FONT   = 'Arial';

// To make speeds 'feel' nicer
var SCALE_DT = 0.001;

// Variables that are private to this file
var _modes = {}

/** Use the get and set method
  * @var {number} scene._score
  * @see scene.getScore
  * @see scene.setScore */
var _score = 0;

var _using_score = false;
var _text_color = DEFAULT_TEXT_COLOR;
var _text_font = DEFAULT_TEXT_FONT;
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
        * This is the devkit {@link View} which all backgrounds should be added to.
        * @var {Background} scene.background
        */
      console.log("DIMENSIONS:", scene.screen.width, scene.screen.height);

      scene.background = new Background({
        parent: this.rootView,
        width: scene.screen.width,
        height: scene.screen.height
      });

      /**
        * This is the devkit {@link View} which all actors should be added to.
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

      scene.ui = new UIView({
        superview: scene.view,
        infinite: true
      });

      /**
       * The root group for all objects created on the scene instead of
       * on their own group.
       * @var {Group} scene.group
       */
      scene.group = new Group({superview: this.stage});

      /**
       * The superview for all text views.
       * @var {View} scene.textContainer
       */
      scene.textContainer = new View({
        parent: this.rootView,
        width:  scene.screen.width,
        height: scene.screen.height,
        blockEvents: true,
        zIndex: 100000
      });

      // An overlay to catch inputs.  Bind things to this
      this.overlay = new View({ parent: this.rootView, infinite: true });
      var touchManager = scene.screen.touchManager;
      this.overlay.onInputStart = bind(touchManager, touchManager.downHandler);
      this.overlay.onInputSelect = bind(touchManager, touchManager.upHandler);
      this.overlay.onInputMove = bind(touchManager, touchManager.moveHandler);

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
        self = this
        scene.screen.onDown(function() {
          self.reset('default');
        }, true);
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

      for (var i in this.groups) {
        this.groups[i].destroy(false);
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
      this.groups = [];
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
      dt *= SCALE_DT;

      scene.collisions.update();
      scene.background.update(dt);
      scene.group.update(dt);
      for (var i = 0; i < this.groups.length; i++) {
        this.groups[i].update(dt);
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

scene.SCALE_MODE = ScaleManager.SCALE_MODE;
scene.scaleManager = new ScaleManager(576, 1024, scene.SCALE_MODE.LOCK_HEIGHT);

scene.setScaleOptions = function(width, height, scaleMode) {
  scene.scaleManager.resize(width, height, scaleMode);
  scene.updateScreenDimensions();
};

/**
 * updateScreenDimensions
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
  * @var {Screen} scene.screen
  */
scene.screen = new Screen(576, 1024);

/**
  * @var {Camera} scene.cam
  */
scene.camera = new Camera(scene.screen.width, scene.screen.height);

/**
  * @var {CollisionManager} scene.collisions
  */
scene.collisions = new CollisionManager();

/**
  * @var {StateManager} scene.state
  */
scene.state = new StateManager();

/**
  * There can be only one player. {@link scene.gameOver} is automatically called when the player is destroyed.
  * @var {Actor} scene.player
  */
scene.player = null;

/** The total number of milliseconds that have elapsed since the start of the game.
  * @var {number} scene.totalDt */
scene.totalDt = 0;

/** The total number of milliseconds that have elapsed since the start of the app.
  * @var {number} scene.totalAppDt */
scene.totalAppDt = 0;


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
scene.onTouch = function(callback) {};


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
scene.onTick = function(cb) {
  _on_tick = cb;
};

/**
 * startAccelerometer(fun)
 *
 * Wraps to the accelerometer module, doesn't do much but provide some niceish
 * calculations by default. If you don't care about those, or are nit-picky with
 * speed, just use the accelerometer module by yourself.
 */
scene.accelerometer = {
  _started: false,
  _onAccelerometer: [],
};

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
scene.onAccelerometer = function(cb) {
  var accelCallbacks = scene.accelerometer._onAccelerometer;
  accelCallbacks.push(cb);

  if (!scene.accelerometer._started) {
    scene.accelerometer._started = true;

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

      for (var i = 0; i < accelCallbacks.length; ++i) {
        accelCallbacks[i](accelObj);
      }
    });
  }
};

scene.stopAccelerometer = function(cb) {
  if (_accelerometer_started) {
    accelerometer.stop();
    _accelerometer_started = false;
  }
};

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
  * @arg {Object} [opts] - contains options to be applied to {@link TextView}
  * @returns {TextView}
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

scene.setTextColor = function(color) {
  // TODO validate?
  _text_color = color;
};

scene.setTextFont = function(font) {
  // TODO validate?
  _text_font = font;
};

/**
  * Set the x and y coordinates in screen space for the score text. The score text remains invisible
  * until this function is called.
  * @func scene.showScore
  * @arg {number} x
  * @arg {number} y
  * @arg {Object} [opts] contains options to be applied to the underlying {@link View}
  * @arg {String} [opts.color]
  * @arg {String} [opts.font]
  */
scene.showScore = function(x, y, opts) {
  if (scene._scoreView) {
    scene._scoreView.style.x = x;
    scene._scoreView.style.y = y;
    opts && scene._scoreView.updateOpts(opts);
    return;
  }

  opts = opts || {};
  opts.font = opts.font || _text_font;
  opts.color = opts.color || _text_color;

  scene._scoreView = new TextView(combine({
    parent: scene.textContainer,
    x: x,
    y: y,
    width: 200,
    height: 75,
    color: opts.color,
    fontFamily: opts.font,
    text: scene.getScore(),
    horizontalAlign: 'left',
  }, opts || {}));

  scene.extraViews.push(scene._scoreView);
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
  * @see scene.setScore
  * @arg {number} amount
  */
scene.addScore = function(add) {
  scene.setScore(scene.getScore() + add);
};

/** @func scene.getScore
  * @returns {number} */
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
  * @arg {number} ms - milliseconds until callback is executed
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
  * @func scene.gameOver
  * @arg {Object} [opts]
  * @arg {number} [opts.delay] - A delay between when this function is called and when the endgame logic is run.
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
 * mode(name, resetFun, opts = {}) - Set a mode to the given function
 * ~ name    the name of the mode to set
 * ~ fun     the function to call from reset, whenever the mode resets or begins
 * ~ opts    options to pass to the mode function
 *
 * mode(name) - Switches to the given mode
 * ~ name    the name of the mode to switch to
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
  scene.mode('splash', fun, opts);
};

scene.addBackground = function(art, opts) {
  return scene.background.addLayer(art, opts);
};

// Change the default class for actors
scene.setActorCtor = function(actorCtor) {
  scene._actorCtor = actorCtor;
};

/**
  * Create a new actor that will be automatically updated each tick
  * @func scene.addActor
  * @param  {String|Object} resource - resource key to be resolved by community art, or opts
  * @param {Object} [opts] - contains options to be applied to the underlying {@link Actor}
  * @returns {Actor}
  */
/**
  * @func scene.addActor(2)
  * @arg {View} view
  * @arg {Object} [opts] - contains options to be applied to the underlying {@link Actor}
  * @returns {Actor}
  */
scene.addActor = function(resource, opts) {
  return scene.group.addActor(resource, opts);
};

/**
  * Sets the scene player, makes sure not to override an existing player.
  * @func scene.addPlayer
  *
  * @see scene.addActor
  * @param  {String|Object} resource - resource key to be resolved by community art, or opts
  * @param {Object} [opts] - contains options to be applied to the underlying {@link Actor}
  * @returns {View} - The newly set player
  */
scene.addPlayer = function(resource, opts) {
  if (scene.player) {
    throw new Error("You can only add one player!");
  }

  scene.player = scene.addActor(resource, opts);
  scene.player.onDestroy(function() {
    scene.gameOver();
  });
  return scene.player;
};

/**
  * Add a new group
  * @func scene.addGroup
  * @arg {Object} [opts]
  * @returns {@link Group}
  */
scene.addGroup = function(opts) {
  opts = opts || {};
  opts.superview = GC.app.stage;
  var result = new Group(opts);
  GC.app.groups.push(result);
  return result;
};

/**
  * Will add a new spawner to the scene's default group.
  * @arg {Spawner} spawner
  * @returns {Spawner} spawner
  * @see {Group#addSpawner}
  */
scene.addSpawner = function(spawner) {
  return scene.group.addSpawner(spawner);
};

/**
  * Will remove a spawner from the scene's default group.
  * @arg {Spawner} spawner
  * @see {Group#removeSpawner}
  */
scene.removeSpawner = function(spawner) {
  return scene.group.removeSpawner(spawner);
};

/**
  * This collision check will be run each tick. {@link callback} will be called only once per tick
  * @func scene.onCollision
  * @arg {Actor|Actor[]|Group|Collidable} a
  * @arg {Actor|Actor[]|Group|Collidable} b
  * @arg {onCollisionCallback} callback
  * @arg {boolean} [allCollisions] - {@link callback} may be called more than once per tick
  * @see CollisionChecker
  * @returns {number} collisionCheckID
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

// More shortcuts
scene.actor = {
  Actor: Actor,
  SAT: SATActor
}
scene._actorCtor = scene.actor.Actor;

/** Easy access to spawner classes
  * @var {Object} scene.spawner
  * @prop {Timed} scene.spawner.Spawner
  * @prop {Horizontal} scene.spawner.Horizontal
  * @prop {Vertical} scene.spawner.Vertical */
scene.spawner = {
  Horizontal: HorizontalSpawner,
  Vertical: VerticalSpawner,
  Timed: Spawner
};

/** Easy access to shape classes
  * @var {Object} scene.shape
  * @prop {Rect} scene.shape.Rect
  * @prop {Line} scene.shape.Line */
scene.shape = {
  Rect: Rect,
  Line: Line
};

scene.collision = {
  CollisionChecker: CollisionChecker
};

// TODO: seems like this calls for ... another manager!
scene.animationGroups = null;

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
  * @arg {View}    subject
  * @arg {string}  [name]
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

scene.transitions = transitions;

scene.audio = new SceneAudioManager();
scene.addSound = bind(scene.audio, "addSound");
scene.addSoundGroup = bind(scene.audio, "addSoundGroup");
scene.addMusic = bind(scene.audio, "addMusic");
scene.playSound = bind(scene.audio,"playSound");
scene.playMusic = bind(scene.audio,"playMusic");
scene.stopMusic = bind(scene.audio,"stopMusic");

scene.reset = function() {
  GC.app.reset();
};

/**
  * @method scene.addScoreText
  * @param  {String|Object} resource - resource key to be resolved by community art, or opts
  * @param {Number} x
  * @param {Number} y
  * @param {Object} opts
  * @returns {SceneScoreView}
  */
scene.addScoreText = function(resource, x, y, opts) {
  var resourceOpts = communityart.getConfig(resource, 'ScoreView');
  opts = opts || {};

  opts.superview = opts.superview || scene.stage;
  opts.x = x;
  opts.y = y;
  opts.format = opts.format || SceneScoreView.FORMAT_SCORE;

  var viewOpts = merge(opts, resourceOpts);
  return new SceneScoreView(viewOpts);
};

// TODO: This is a bit of a hack, make it better
scene._useWeeby = false;
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
