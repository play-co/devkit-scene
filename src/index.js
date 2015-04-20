import device;
import animate;
import ui.View as View;
import ui.TextView as TextView;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.ScoreView as ScoreView;

import accelerometer;
import entities.Entity as Entity;

import .spawner.HorizontalSpawner as HorizontalSpawner;
import .spawner.VerticalSpawner as VerticalSpawner;
import .spawner.Spawner as Spawner;

import .shape.Line as Line;
import .shape.Rect as Rect;

import .collision.CollisionManager as CollisionManager;
import .collision.CollisionChecker as CollisionChecker;

import .Actor;
import .Group;
import .Screen;
import .Camera;
import .Background;
import .SceneText;
import .utils;

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

  return Class(GC.Application, function() {
    /**
     * initUI
     */
    this.initUI = function() {
      this.rootView = this.view;

      this.setScreenDimensions();

      /**
        * This is the devkit {@link View} which all backgrounds should be added to.
        * @var {Background} scene.background
        */
      scene.background = new Background({
        parent: this.rootView,
        width: scene.screen.width,
        height: scene.screen.height
      });

      /**
        * The devkit {@link View} which contains the entire scene.
        * @var {View} scene.view
        */
      scene.view = this.rootView;

      /**
        * This is the devkit {@link View} which all actors should be added to.
        * @var {View} scene.stage
        */
      this.stage = new View({
        parent: scene.view,
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

      this.overlay = new View({ parent: this.rootView, infinite: true });
      // bind our screen functions to the overlay
      this.overlay.onInputStart = scene.screen.inputStartHandler.bind(scene.screen);
      this.overlay.onInputSelect = scene.screen.inputStopHandler.bind(scene.screen);
      this.overlay.onInputMove = scene.screen.inputMoveHandler.bind(scene.screen);
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
        scene.screen.onTouchOnce(function() {
          self.reset('default');
        })
      } else {
        this.reset();
      }
    }

    /**
     * reset
     */
    this.reset = function(mode) {
      if (mode === undefined) mode = 'default';

      effects.commit();
      scene.clearAnimations();
      this.setScreenDimensions();
      scene.screen.resetTouches();
      scene.background.reset();

      scene.collisions.reset();
      scene.group.destroy();
      scene.player = null;
      scene.camera.stopFollowing();
      scene.camera.x = 0;
      scene.camera.y = 0;

      for (var i in this.groups) {
        this.groups[i].destroy();
      }

      for (var j in this.spawners) {
        this.spawners[j].destroy();
      }

      for (var k in scene.extraViews) {
        scene.extraViews[k].removeFromSuperview();
      }

      delete scene._scoreView;
      scene.background.destroy();

      // Clear the tallies
      scene.extraViews = [];
      this.groups = [];
      this.spawners = [];
      _score = 0;
      _on_tick = null;

      // Let's reboot the fun!
      var currentMode = _modes[mode]
      currentMode.fun(currentMode.opts);

      scene.background.reloadConfig();

      // The curtain rises, and Act 1 begins!
      _game_running = true;
    }

    /**
     * setScreenDimensions
     */
    this.setScreenDimensions = function() {

      var ds = device.screen;
      var vs = this.rootView.style;
      var targetHeight = ds.width > ds.height ? 576 : 1024;

      vs.scale = device.height / targetHeight;
      vs.width = device.width / vs.scale;
      vs.height = targetHeight;

      vs.x = (ds.width - vs.width) / 2;
      vs.y = (ds.height - vs.height) / 2;
      vs.anchorX = vs.width / 2;
      vs.anchorY = vs.height / 2;

      scene.camera.resize(vs.width, vs.height);
      scene.screen.width = vs.width;
      scene.screen.height = vs.height;
    };

    /**
     * tick tock
     */
    this.tick = function(dt) {
      if (_on_tick) {
        _on_tick(dt);
      }

      scene.totalDt += dt;

      for (var i = 0; i < this.spawners.length; i++) {
        this.spawners[i].tick(dt);
      }

      dt *= SCALE_DT;

      scene.background.update(dt);
      scene.group.update(dt);
      for (var i = 0; i < this.groups.length; i++) {
        this.groups[i].update(dt);
      }
      scene.camera.update(dt);
      scene.collisions.update();
      this.stage.style.x = -scene.camera.x;
      this.stage.style.y = -scene.camera.y;
      scene.background.scrollTo(-scene.camera.x, -scene.camera.y);
    }
  });

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
  * There can be only one player. {@link scene.gameOver} is automatically called when the player is destroyed.
  * @var {Actor} scene.player
  */
scene.player = null;

/** The total number of milliseconds that have elapsed since the start of the game.
  * @var {number} scene.totalDt */
scene.totalDt = 0;


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

      var x = -evt.x;
      var y = -evt.y;
      var z = -evt.z;
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
  * @returns {number} intervalID
  */
scene.addInterval = function(callback, ms) {};

/**
  * Remove an interval before it has executed. Replacement for `clearInterval`.
  * @func scene.removeInterval
  * @arg {number} intervalID
  */
scene.removeInterval = function(intervalID) {};

/**
  * Execute a callback after a specified amount of milliseconds. Callback will only execute once.
  * Game dt will be used to determine how long has passed, not system time. Replacement for `setTimeout`.
  * @func scene.addTimeout
  * @arg {function} callback
  * @arg {number} ms - milliseconds until callback is executed
  * @returns {number} timeoutID
  */
scene.addTimeout = function(callback, ms) {};

/**
  * Remove a timeout before it has executed. Replacement for `clearTimeout`.
  * @func scene.removeTimeout
  * @arg {number} timeoutID
  */
scene.removeTimeout = function(timeoutID) {};



/**
  * When called, this function will restart the game.
  * @func scene.gameOver
  * @arg {Object} [opts]
  * @arg {number} [opts.delay] - A delay between when this function is called and when the endgame logic is run.
  * @arg {boolean} [opts.noGameoverScreen] - Optionally skip the "Game Over" text.
  */
scene.gameOver = function(opts) {
  opts = opts || {};
  opts.delay = opts.delay !== undefined ? opts.delay : 1000;

  if (_game_running) {
    _game_running = false;

    setTimeout(function () {
      if (!opts.noGameoverScreen) {
        var bgHeight = scene.screen.height;

        // TODO: This should be a scene splash ... not random text. Allows the player to set their own game over splash.
        if (_using_score) {
          scene.addText('Game Over!', { y: bgHeight / 2 - DEFAULT_TEXT_HEIGHT });
          scene.addText('Score: ' + _score, { y: bgHeight / 2 + 10 });
        } else {
          scene.addText('Game Over!');
        }

        scene.screen.onTouchOnce(function () {
          setTimeout(function () { GC.app.reset() });
        });
      }
    }, opts.delay);
  }
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

/**
  * Create a new actor that will be automatically updated each tick
  * @func scene.addActor
  * @arg {View} view
  * @arg {Object} [opts] - contains options to be applied to the underlying {@link Actor}
  * @returns {Actor}
  */
/**
  * @func scene.addActor(2)
  * @arg {View} view
  * @arg {number} x
  * @arg {number} y
  * @arg {Object} [opts] - contains options to be applied to the underlying {@link Actor}
  * @returns {Actor}
  */
scene.addActor = function(resource, x, y, opts) {
  opts = opts || {};

  if (typeof x === 'object') {
    // Function type 1
    opts = x;
    x = undefined;
    y = undefined;
  } else if (typeof x === 'number' && typeof y === 'number') {
    // Function type 2
    opts.x = x;
    opts.y = y;
  }

  // Default position
  opts.x = opts.x !== undefined ? opts.x : scene.camera.x + scene.camera.width / 2;
  opts.y = opts.y !== undefined ? opts.y : scene.camera.y + scene.camera.height / 2;

  // Defualt group
  opts.group = opts.group || scene.group;
  opts.parent = opts.parent || scene.stage;

  opts.url = (typeof resource === "string") ? resource : resource.url;
  return opts.group.obtain(opts.x, opts.y, opts);
};

/**
  * Sets the scene player, makes sure not to override an existing player.
  * @func scene.addPlayer
  *
  * @see scene.addActor
  * @arg {View} view
  * @arg {Object} [opts] - contains options to be applied to the underlying {@link Actor}
  * @returns {View} - The newly set player
  */
scene.addPlayer = function(resource, opts) {
  if (scene.player) { throw new Error("You can only add one player!"); }
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
  var result = new Group({superview: GC.app.stage});
  GC.app.groups.push(result);
  return result;
};

/**
  * Helper object for creating and registering new things
  * @prop {function} spawner - Returns a new {@link Spawner}
  */
scene.addSpawner = function(spawner) {
  GC.app.spawners.push(spawner);
  return spawner;
};

scene.removeSpawner = function(spawner) {
  var index = GC.app.spawners.indexOf(spawner);
  if (index !== -1) {
    var lastSpawner = GC.app.spawners.pop();
    if (index < GC.app.spawners.length) {
      GC.app.spawners[index] = lastSpawner;
    }
  }
};

scene.onTap = bind(scene.screen, scene.screen.onTap);
scene.removeOnTap = bind(scene.screen, scene.screen.removeOnTap);
scene.onTouchOnce = bind(scene.screen, scene.screen.onTouchOnce);

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

scene.animations = [];

scene.clearAnimations = function() {
  for (var i = 0; i < scene.animations.length; i++) {
    scene.animations[i].clear();
  }
  scene.animations = [];
};

/**
  * @func scene.animate
  * @arg {View}    subject
  * @arg {string}  [name]
  * @returns {Animator} anim
  */
scene.animate = function(subject, name) {
  var anim = animate(subject, name);
  if (scene.animations.indexOf(anim) === -1) {
    scene.animations.push(anim);
  }
  return anim;
};

scene.configureBackground = function(config) {
  scene.background.reloadConfig(config);
};

exports = scene;
