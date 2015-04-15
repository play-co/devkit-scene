import device;
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
import .utils;

import communityart;

// Default values
var DEFAULT_TEXT_WIDTH  = 200;
var DEFAULT_TEXT_HEIGHT = 50;
var DEFAULT_TEXT_COLOR  = '#111';
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
      this.textContainer = new View({
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
        this.spawners[i].destroy();
      }

      for (var k in this.extraViews) {
        this.extraViews[k].removeFromSuperview();
      }

      delete this.scoreView;
      scene.background.destroy();

      // Clear the tallies
      this.extraViews = [];
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
      var targetWidth = ds.width > ds.height ? 1024 : 576;

      vs.width = targetWidth;
      vs.height = ds.height * (targetWidth / device.width);
      vs.scale = device.width / targetWidth;

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
 * addText
 * ~ x      x location
 * ~ y      y location
 * ~ text   text to draw
 * ~ opts   additional opts to pass to the TextView
 *
 * This function perhaps draws text to the screen.
 */
scene.addText = function(x, y, text, opts) {
  GC.app.extraViews.push(new TextView(combine({
    superview: GC.app.textContainer,
    text: text,
    x: x,
    y: y,
    color: _text_color,
    fontFamily: _text_font,
    width: DEFAULT_TEXT_WIDTH,
    height: DEFAULT_TEXT_HEIGHT,
  }, opts || {})));
}

scene.horCenterText = function(y, text, opts) {
  opts = opts || {};
  opts.width = GC.app.rootView.style.width;
  scene.addText(0, y, text, opts);
}

scene.centerText = function(text, opts) {
  scene.horCenterText(scene.screen.height / 2 - DEFAULT_TEXT_HEIGHT / 2, text, opts);
}

scene.setTextColor = function(color) {
  // TODO validate?
  _text_color = color;
}

scene.setTextFont = function(font) {
  // TODO validate?
  _text_font = font;
}

/**
  * Set the x and y coordinates in screen space for the score text. The score text remains invisible
  * until this function is called.
  * @func scene.showScore
  * @arg {number} x
  * @arg {number} y
  * @arg {String} color
  * @arg {String} font
  * @arg {Object} [opts] contains options to be applied to the underlying {@link View}
  */
scene.showScore = function(x, y, color, font, opts) {
  font = font || 'Arial';
  color = color || '#111';

  var app = GC.app;
  if (app.scoreView) return;

  if (typeof(color) == 'object') {
    opts = color;
    color = undefined;
  }

  if (typeof(font) == 'object') {
    opts = font;
    font = undefined;
  }

  app.scoreView = new TextView(combine({
    parent: app.textContainer,
    x: x,
    y: y,
    width: 200,
    height: 75,
    color: color,
    fontFamily: font,
    text: scene.getScore(),
    horizontalAlign: 'left',
  }, opts || {}));

  app.extraViews.push(app.scoreView);
}

/**
  * Calling this function will set {@link scene._score} and update the score view.
  * @func scene.setScore
  * @arg {number} newScore
  */
scene.setScore = function(score) {
  if (_game_running) {
    _score = score;
    _using_score = true;
    if (GC.app.scoreView) {
      GC.app.scoreView.setText('' + score);
    }
  }
}

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
  * When called, this function will restart the game
  * @func scene.gameOver
  */
scene.gameOver = function(opts) {
  if (_game_running) {
    _game_running = false;

    if (!opts || !opts.no_gameover_screen) {
      var bgHeight = scene.screen.height;

      if (_using_score) {
        scene.horCenterText(bgHeight / 2 - DEFAULT_TEXT_HEIGHT, 'Game over!');
        scene.horCenterText(bgHeight / 2, 'Your score was ' + _score);
      } else {
        scene.centerText('Game over!');
      }

      scene.screen.onTouchOnce(function () {
        GC.app.reset();
      });
    }
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
  * @returns {View}
  */
scene.addActor = function(resource, opts) {
  opts = opts || {};
  var imageURL = (typeof resource === "string") ? resource : resource.url;
  opts.url = imageURL;
  return scene.group.obtain(
    opts.x || scene.camera.x + scene.screen.width / 2,
    opts.y || scene.camera.y + scene.screen.height / 2,
    opts
  );
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

scene.spawner = {
  Horizontal: HorizontalSpawner,
  Vertical: VerticalSpawner,
  Timed: Spawner
};

scene.shape = {
  Rect: Rect,
  Line: Line
};

scene.collision = {
  CollisionChecker: CollisionChecker
};


exports = scene;
