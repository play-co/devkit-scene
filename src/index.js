import device;
import ui.View as View;
import ui.TextView as TextView;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.ScoreView as ScoreView;

import accelerometer;
import entities.Entity as Entity;

import .util;
import .Actor;
import .Ghost;
import .Spawner;
import .Background;

// Default values
var DEFAULT_TEXT_WIDTH  = 200;
var DEFAULT_TEXT_HEIGHT = 50;
var DEFAULT_TEXT_COLOR  = 'white';
var DEFAULT_TEXT_FONT   = 'Arial';

// To make speeds 'feel' nicer
var SCALE_DT = 0.01;

// Variables that are private to this file
var _modes = {}
var _score = 0;
var _using_score = false;
var _text_color = DEFAULT_TEXT_COLOR;
var _text_font = DEFAULT_TEXT_FONT;
var _game_running = false;
var _accelerometer_started = false;
var _on_tick = null;

/**
 * Object tracking:
 *  track(object)     - begin tracking given object
 *  untrack(object)   - stop tracking an object
 *  _tracked = [...]  - array of tracked objects
 */
var _tracked = [];

function _track(object) {
  _tracked.push(object);
  return object;
}

function _untrack(object) {
  var i = _tracked.indexOf(object);
  if (i >= 0) {
    _tracked.splice(i, 1);
  } else {
    throw 'Attempting to untrack object that was untracked in the first place.';
  }
}

/**
 * The primary scene function, imports weeby if needed and sets the default mode function
 */
scene = function (defaultModeFun) {
  // Potentially include weeby
  if (scene.enableWeeby) {
    weeby = jsio('import weeby');
    var Application = weeby.Application;
  } else {
    weeby = null;
    var Application = GC.Application;
  }

  scene.mode('default', defaultModeFun);

  return Class(Application, function() {
    /**
     * initUI
     */
    this.initUI = function() {
      if (weeby === null) {
        this.rootView = this.view;
      } else {
        this.rootView = weeby.getGameView();
      }

      // The superview for all views that do not except possible input
      this.staticView = new View({
        parent: this.rootView,
        width:  scene.screen.width,
        height: scene.screen.height,
        blockEvents: true,
      })

      scene.background = new Background(this.staticView);
      this.overlay = new View({ parent: this.rootView, infinite: true });

      // TODO maybe infinite in one dimension for each of these?
      var w = scene.screen.width;
      var h = scene.screen.height;
      scene.screen.left   = new Ghost(-10,  -h,  10, 3*h, { parent: this.staticView });
      scene.screen.right  = new Ghost(  w,  -h,  10, 3*h, { parent: this.staticView });
      scene.screen.top    = new Ghost( -w, -10, 3*w,  10, { parent: this.staticView });
      scene.screen.bottom = new Ghost( -w,   h, 3*w,  10, { parent: this.staticView });
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
        scene.screen.onOneTouch(function() {
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

      // Cleanup after the last performance before begining a new one
      for (var k in _tracked) {
        _tracked[k].destroy();
      }

      for (var k in this.extraViews) {
        this.extraViews[k].removeFromSuperview();
      }

      for (var k in this.spawners) {
        this.spawners[k].destroy();
      }

      delete this.scoreView;
      scene.background.destroy();

      // Clear the tallies
      this.extraViews = [];
      this.spawners = [];
      _score = 0;
      _tracked = [];
      _on_tick = null;

      // Let's reboot the fun!
      var currentMode = _modes[mode]
      currentMode.fun(currentMode.opts);

      // Let the players take their places.
      for (var k in _tracked) {
        _tracked[k].reset();
      }

      // The backdrop falls into place.
      scene.background.reset();

      // Now let us frame the scene.
      scene.screen.left.reset();
      scene.screen.right.reset();
      scene.screen.top.reset();
      scene.screen.bottom.reset();

      // The minions of evil doth depart
      for (var k in this.spawners) {
        this.spawners[k].reset();
      }

      // The curtain rises, and Act 1 begins!
      _game_running = true;
    }

    /**
     * setScreenDimensions
     */
    this.setScreenDimensions = function(w, h) {
      var ds = device.screen;
      var vs = this.rootView.style;

      w = scene.screen.width;
      h = scene.screen.height;

      vs.width  = w > h ? ds.width  * (h / ds.height) : w;
      vs.height = w < h ? ds.height * (w / ds.width ) : h;
      vs.scale  = w > h ? ds.height / h : ds.width / w;
    }

    /**
     * tick tock
     */
    this.tick = function(dt) {
      for (var k in _tracked) {
        _tracked[k].update(dt * SCALE_DT);
      }

      for (var k in this.spawners) {
        this.spawners[k].update(dt);
      }

      scene.background.update(dt * SCALE_DT);

      scene.screen.left.update(dt);
      scene.screen.right.update(dt);
      scene.screen.top.update(dt);
      scene.screen.bottom.update(dt);

      if (_on_tick) {
        _on_tick(dt);
      }
    }
  })
}

/**
 * A wonderous object that describes the screen
 */
scene.screen = {
  // I am not sure about these defaults; maybe we should default to device dimensions
  width: 576,
  height: 1024,

  /**
   * screen.onTouch(cb) - register event that happens on the screen being touched
   */
  onTouch:
    function(cb) {
      GC.app.overlay.onInputStart = cb;
    },

  offTouch:
    function() {
      delete GC.app.overlay.onInputStart;
    },

  /**
   * screen.onTouchLoss(cb)
   */
  onTouchLoss:
    function(cb) {
      GC.app.overlay.onInputSelect = cb;
    },

  offTouchLoss:
    function() {
      delete GC.app.overlay.onInputSelect;
    },

  /**
   * screen.onOneTouch(cb) - Like onTouch, but only happens once
   */
  onOneTouch:
    function(cb) {
      GC.app.overlay.onInputStart = function() {
        scene.screen.offTouch();
        cb();
      }
    },

  /**
   * screen.onDrag(cb)
   *  FIXME cannot be used with onTouch/onTouchLoss
   */
  onDrag: function(cb) {
    var down;

    scene.screen.onTouch(function(event, point) {
      down = point;
    });

    scene.screen.onTouchLoss(function(event, up) {
      if (down !== undefined) {
        cb(down.x, down.y, up.x, up.y);
        down = undefined;
      }
    });
  }
};

/**
 * onTick(cb)
 */
scene.onTick = function(cb) {
  _on_tick = cb;
}

/**
 * startAccelerometer(fun)
 *
 * Wraps to the accelerometer module, doesn't do much but provide some niceish
 * calculations by default. If you don't care about those, or are nit-picky with
 * speed, just use the accelerometer module by yourself.
 */
scene.startAccelerometer = function(cb) {
  _accelerometer_started = true;

  accelerometer.start(function(evt) {
    var x = -evt.x;
    var y = -evt.y;
    var z = -evt.z;

    cb({
      x: x,
      y: y,
      z: z,
      forwardTilt: Math.atan2(z, y),
      tilt: Math.atan2(x, y),
      twist: Math.atan2(x, z),
    });
  });
}

scene.stopAccelerometer = function(cb) {
  if (_accelerometer_started) {
    accelerometer.stop();
    _accelerometer_started = false;
  }
}

/**
 * createActor(resource, opts = {})
 *
 * Possible resource object structures:
 *   {
 *     type: 'image',
 *     url: 'url/path/to/image.png',
 *   }
 *
 *   {
 *     type: 'sprite',
 *     url: 'url/prefix/for/sprite',
 *     framerate: 12
 *   }
 *
 * Casting is important. The right actor must play the right part, lest the play be faulty.
 */
scene.createActor = function(resource, opts) {
  opts = opts || {};
  opts.parent = GC.app.rootView;

  if (resource.type === 'image') {
    // static image
    var viewClass = ImageView;
    opts.image = resource.url;
  } else
  if (resource.type === 'sprite') {
    // animated image
    var viewClass = SpriteView;
    opts.url = resource.url;
    opts.autoStart = false;
  }

  return _track(new Actor(scene, viewClass, opts));
}

scene.removeActor = function(actor) {
  _untrack(actor);
  actor.destroy();
}

/**
 * addGhost(x, y, w, h, [opts])  - create a collidable box
 * addGhost(x, y, r, [opts])     - create a collidable circle
 */
scene.addGhost = function(x, y, w, h, opts) {
  opts = opts || {};
  opts.parent = GC.app.staticView;
  return _track(new Ghost(x, y, w, h, opts));
}

/**
 * addBackgroundLayer
 */
scene.addBackgroundLayer = function(resource, opts0) {
  return scene.background.addLayer(resource, opts0);
}

/**
 * addSpawner
 *
 * See Spawner.js for a description of the arguments
 */
scene.addSpawner = function(spawnEntity, opts) {
  var sp = new Spawner(spawnEntity, opts);
  GC.app.spawners.push(sp);
  return sp;
}

/**
 * drawText
 * ~ x      x location
 * ~ y      y location
 * ~ text   text to draw
 * ~ opts   additional opts to pass to the TextView
 *
 * This function perhaps draws text to the screen.
 */
scene.drawText = function(x, y, text, opts) {
  GC.app.extraViews.push(new TextView(combine({
    superview: GC.app.staticView,
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
  scene.drawText(0, y, text, opts);
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
 * showScore
 */
scene.showScore = function(x, y, color, font, opts) {
  font = font || 'Arial';
  color = color || 'white';

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
    parent: app.staticView,
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
 * score getters/setters
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

scene.addScore = function(add) {
  scene.setScore(scene.getScore() + add);
}

scene.getScore = function() {
  _using_score = true;
  return _score;
}

/**
 * gameOver
 *
 * Alas, the final act comes to a close, the curtains fall and the lights dim.
 */
scene.gameOver = function(opts) {
  if (_game_running) {
    _game_running = false;

    for (var k in _tracked) {
      if (_tracked[k].stopInput) {
        _tracked[k].stopInput();
      }
    }

    if (!opts.no_gameover_screen) {
      var bgHeight = scene.screen.height;

      if (_using_score) {
        scene.horCenterText(bgHeight / 2 - DEFAULT_TEXT_HEIGHT, 'Game over!');
        scene.horCenterText(bgHeight / 2, 'Your score was ' + _score);
      } else {
        scene.centerText('Game over!');
      }

      scene.screen.onOneTouch(function () {
        GC.app.reset();
      });
    }
  }
}

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
}

/**
 * splash(fun, opts)
 */
scene.splash = function(fun, opts) {
  scene.mode('splash', fun, opts);
}

exports = scene;
