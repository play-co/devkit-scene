import device;
import ui.View as View;
import ui.TextView as TextView;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.ScoreView as ScoreView;
import entities.Entity as Entity;
import entities.EntityPool as EntityPool;
import parallax.Parallax as Parallax;

import .Actor;
import .Ghost;

var DEFAULT_TEXT_WIDTH = 100;
var DEFAULT_TEXT_HEIGHT = 50;

var modes = {}

var merge = function(a, b) {
  for (var k in b) a[k] = b[k];
  return a;
}

/**
 * randRange(low, high, bipolar = false)
 * ~ low        The minimum value to generate
 * ~ high       The maximum value to generate
 * ~ bipolar    If true, will 1/2 the time negate the generated value
 */
randRange = function(low, high, bipolar) {
  var n = Math.random() * (high - low) + low;
  if (bipolar && Math.random() < .5) n *= -1;
  return n;
}

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
      // I am not sure about these defaults; maybe we should default to device dimensions
      this.setScreenDimensions(576, 1024);

      // This comment is to inform you that default mode is 'default'
      this.mode = 'default';

      // The superview for all views that do not except possible input
      this.staticView = new View({
        parent: this.view,
        y: this.view.style.height - this.bgHeight,
        width:  this.bgWidth,
        height: this.bgHeight,
        blockEvents: true,
      })

      this.parallax = new Parallax({ parent: this.staticView });
      this.overlay = new View({ parent: this.view, infinite: true });

      this.bgOffsetX = 0;
      this.bgOffsetY = 0;

      // TODO maybe infinite in one dimension for each of these?
      w = this.bgWidth;
      h = this.bgHeight;
      scene.screen.left   = new Ghost(-10,  -h,  10, 3*h, { parent: this.staticView });
      scene.screen.right  = new Ghost(  w,  -h,  10, 3*h, { parent: this.staticView });
      scene.screen.top    = new Ghost( -w, -10, 3*w,  10, { parent: this.staticView });
      scene.screen.bottom = new Ghost( -w,   h, 3*w,  10, { parent: this.staticView });

      // account for starting the game without weeby
      if (weeby === null) {
        this.launchUI = bind(this, this.onStartGame());
      }
    }

    /**
     * onStartGame
     */
    this.onStartGame = function() {
      // show the splash screen
      if (modes.splash) {
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
      if (mode) {
        this.mode = mode;
      }

      // Cleanup after the last performance before begining a new one
      for (var k in this.actors) {
        this.actors[k].destroy();
      }

      for (var k in this.extraViews) {
        this.extraViews[k].removeFromSuperview();
      }

      delete this.scoreView;

      // Clear the tallies
      this.actors = [];
      this.bgLayers = [];
      this.extraViews = [];
      this.ghosts = [];
      scene.score = 0;

      // Let's reboot the fun!
      var currentMode = modes[this.mode]
      currentMode.fun(currentMode.opts);

      // Let the players take their places.
      for (var k in this.actors) {
        this.actors[k].reset();
      }

      // The backdrop falls into place.
      this.parallax.reset(this.bgLayers);

      // Now let us frame the scene.
      scene.screen.left.reset();
      scene.screen.right.reset();
      scene.screen.top.reset();
      scene.screen.bottom.reset();

      // Be wary, for ghosts haunt the stage
      for (var k in this.ghosts) {
        this.ghosts[k].reset();
      }

      // The curtain rises, and Act 1 begins!
      this.game_running = true;
    }

    /**
     * setScreenDimensions
     */
    this.setScreenDimensions = function(w, h) {
      var ds = device.screen;
      var vs = this.view.style;

      this.bgWidth = w;
      this.bgHeight = h;
      scene.screen.width = w;
      scene.screen.height = h;

      vs.width  = w > h ? ds.width  * (h / ds.height) : w;
      vs.height = w < h ? ds.height * (w / ds.width ) : h;
      vs.scale  = w > h ? ds.height / h : ds.width / w;
    }

    /**
     * tick
     */
    this.tick = function(dt) {
      for (var k in this.actors) {
        this.actors[k].update(dt);
      }

      this.bgOffsetX += 1;
      this.bgOffsetY += 1;
      this.parallax.update(this.bgOffsetX, this.bgOffsetY);

      scene.screen.left.update(dt);
      scene.screen.right.update(dt);
      scene.screen.top.update(dt);
      scene.screen.bottom.update(dt);
    }
  })
}

scene.score = 0;
scene.usingScore = false;

scene.screen = {
  /**
   * screen.onTouch(cb) - register event that happens on the screen being touched
   */
  onTouch:
    function(cb) {
      GC.app.overlay.onInputSelect = cb;
    },

  offTouch:
    function() {
      delete GC.app.overlay.onInputSelect;
    },

  /**
   * screen.onOneTouch(cb) - Like onTouch, but only happens once
   */
  onOneTouch:
    function(cb) {
      GC.app.overlay.onInputSelect = function() {
        scene.screen.offTouch();
        cb();
      }
    }
};

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
  opts.parent = GC.app.view;

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

  var a = new Actor(scene, viewClass, opts);
  GC.app.actors.push(a);
  return a;
}

/**
 * addGhost(x, y, w, h, [opts])  - create a collidable box
 * addGhost(x, y, r, [opts])     - create a collidable circle
 */
scene.addGhost = function(x, y, w, h, opts) {
  opts = opts || {};
  opts.parent = GC.app.staticView;
  var c = new Ghost(x, y, w, h, opts);
  GC.app.ghosts.push(c);
  return c;
}

/**
 * addBackgroundLayer
 */
scene.addBackgroundLayer = function(resource, opts0) {
  if (resource.type !== 'image') {
    throw 'Background layers must be images, but you gave me a ' + resource.type + '!';
  }

  opts0 = opts0 || {};
  opts = {
    zIndex: -1,
    xGapRange: [0, 0],
    yGapRange: [0, 0],
    pieceOptions: [{ image: resource.url }],
  };

  if (opts0.scrollY && !opts0.scrollX) {
    opts.xCanSpawn = false;
    opts.xCanRelease = false;
  }

  if (!opts0.scrollY && opts0.scrollX) {
    opts.yCanSpawn = false;
    opts.yCanRelease = false;
  }

  opts.xMultiplier = opts0.scrollX || 0;
  opts.yMultiplier = opts0.scrollY || 0;
  delete opts0.scrollX;
  delete opts0.scrollY;

  GC.app.bgLayers.push(merge(opts, opts0));
  return opts
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
  GC.app.extraViews.push(new TextView(merge({
    superview: GC.app.staticView,
    text: text,
    x: x,
    y: y,
    color: 'white',
    width: DEFAULT_TEXT_WIDTH,
    height: DEFAULT_TEXT_HEIGHT,
  }, opts || {})));
}

scene.horCenterText = function(y, text, opts) {
  opts = opts || {};
  opts.width = GC.app.view.style.width;
  scene.drawText(0, y, text, opts);
}

scene.centerText = function(text, opts) {
  scene.horCenterText(GC.app.bgHeight / 2 - DEFAULT_TEXT_HEIGHT / 2, text, opts);
}

/**
 * showScore
 */
scene.showScore = function(x, y, opts) {
  var app = GC.app;
  if (app.scoreView) return;

  app.scoreView = new TextView(merge({
    parent: app.staticView,
    x: x,
    y: y,
    width: 200,
    height: 75,
    color: 'white',
    text: scene.getScore(),
    horizontalAlign: 'left',
  }, opts || {}));

  app.extraViews.push(app.scoreView);
}

/**
 * score getters/setters
 */
scene.setScore = function(score) {
  scene.score = score;
  scene.usingScore = true;
  if (GC.app.scoreView) {
    GC.app.scoreView.setText('' + score);
  }
}

scene.addScore = function(add) {
  scene.setScore(scene.getScore() + add);
}

scene.getScore = function() {
  scene.usingScore = true;
  return scene.score;
}

/**
 * gameOver
 *
 * Alas, the final act comes to a close, the curtains fall and the lights dim.
 */
scene.gameOver = function(opts) {
  if (GC.app.game_running) {
    GC.app.game_running = false;

    for (var k in GC.app.actors) {
      GC.app.actors[k].stop();
    }

    if (!opts.no_gameover_screen) {
      var bgHeight = GC.app.bgHeight;

      if (scene.usingScore) {
        scene.horCenterText(bgHeight / 2 - DEFAULT_TEXT_HEIGHT, 'Game over!');
        scene.horCenterText(bgHeight / 2, 'Your score was ' + scene.score);
      } else {
        scene.centerText('Game over!');
      }

      scene.screen.onOneTouch(function () {
        GC.app.reset();
      })
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
    modes[name] = {
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
