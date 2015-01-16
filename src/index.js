import device;
import ui.View as View;
import ui.TextView as TextView;
import ui.ImageView as ImageView;
import ui.ScoreView as ScoreView;
import entities.Entity as Entity;
import entities.EntityPool as EntityPool;
import parallax.Parallax as Parallax;

import .Actor;

// Import weeby if it exists
var Application
try {
  weeby = jsio('import weeby');
  Application = weeby.Application
} catch (e) {
  weeby = null;
  Application = GC.Application;
}

var DEFAULT_TEXT_WIDTH = 100;
var DEFAULT_TEXT_HEIGHT = 50;

var modes = {}

var merge = function(a, b) {
  for (var k in b) a[k] = b[k];
  return a;
}

randRange = function(low, high, bipolar) {
  var n = Math.random() * (high - low) + low;
  if (bipolar && Math.random() < .5) n *= -1;
  return n;
}

scene = function (defaultModeFun) {
  scene.mode('default', defaultModeFun)

  return Class(Application, function() {
    /**
     * initUI
     */
    this.initUI = function() {
      // I am not sure about these defaults; maybe we should default to device dimensions
      this.setScreenDimensions(576, 1024)

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

      this.parallax = new Parallax({ parent: this.staticView })
      this.overlay = new View({ parent: this.view, infinite: true })

      this.bgOffsetX = 0
      this.bgOffsetY = 0

      scene.screen.left   = new Entity({ parent: this.staticView })
      scene.screen.right  = new Entity({ parent: this.staticView })
      scene.screen.top    = new Entity({ parent: this.staticView })
      scene.screen.bottom = new Entity({ parent: this.staticView })
    }

    /**
     * launchUI
     */
    this.launchUI = function() {
      // show the splash screen
      if (modes.splash) {
        this.reset('splash')

        // start the game when you click
        self = this
        this.overlay.onInputSelect = function() {
          delete self.overlay.onInputSelect;
          self.reset('default');
        }
      } else {
        this.reset()
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
        this.actors[k].destroy()
      }

      for (var k in this.extraViews) {
        this.extraViews[k].removeFromSuperview()
      }

      delete this.scoreView;

      // Clear the tallies
      this.actors = []
      this.bgLayers = []
      this.extraViews = []
      scene.score = 0;

      // Let's reboot the fun!
      var currentMode = modes[this.mode]
      currentMode.fun(currentMode.opts);

      // Let the players take their places.
      for (var k in this.actors) {
        this.actors[k].reset()
      }

      // The backdrop falls into place.
      this.parallax.reset(this.bgLayers);

      // Now let us frame the scene.
      // TODO maybe infinite in one dimension for each of these?
      w = this.bgWidth
      h = this.bgHeight
      scene.screen.left.reset  (0, 0, { isAnchored: true, hitBounds: { x: -10, y:  -h, w:  10, h: 3*h } })
      scene.screen.right.reset (0, 0, { isAnchored: true, hitBounds: { x:   w, y:  -h, w:  10, h: 3*h } })
      scene.screen.top.reset   (0, 0, { isAnchored: true, hitBounds: { x:  -w, y: -10, w: 3*w, h:  10 } })
      scene.screen.bottom.reset(0, 0, { isAnchored: true, hitBounds: { x:  -w, y:   h, w: 3*w, h:  10 } })

      // The curtain rises, and Act 1 begins!
      this.game_running = true
    }

    /**
     * setScreenDimensions
     */
    this.setScreenDimensions = function(w, h) {
      var ds = device.screen
      var vs = this.view.style

      this.bgWidth = w
      this.bgHeight = h

      vs.width  = w > h ? ds.width  * (h / ds.height) : w
      vs.height = w < h ? ds.height * (w / ds.width ) : h
      vs.scale  = w > h ? ds.height / h : ds.width / w
    }

    /**
     * tick
     */
    this.tick = function(dt) {
      for (var k in this.actors) {
        this.actors[k].update(dt)
      }

      this.bgOffsetX += 1 
      this.bgOffsetY += 1
      this.parallax.update(this.bgOffsetX, this.bgOffsetY)

      scene.screen.left.update(dt)
      scene.screen.right.update(dt)
      scene.screen.top.update(dt)
      scene.screen.bottom.update(dt)
    }
  })
}

scene.screen = {};
scene.score = 0;
scene.usingScore = false;

/**
 * createActor
 * ~ resource    as of now simply a path to an image
 *
 * Casting is important. The right actor must play the right part, lest the play be faulty.
 */
scene.createActor = function(resource) {
  a = new Actor(scene, {
    image: resource,
    parent: GC.app.view,
  })
  GC.app.actors.push(a)
  return a
}

scene.addBackgroundLayer = function(resource, opts0) {
  opts0 = opts0 || {};
  opts = {
    zIndex: -1,
    xGapRange: [0, 0],
    yGapRange: [0, 0],
    pieceOptions: [{ image: resource }],
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
  scene.drawText(0, y, text, opts)
}

scene.centerText = function(text, opts) {
  scene.horCenterText(GC.app.bgHeight / 2 - DEFAULT_TEXT_HEIGHT / 2, text, opts)
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
    GC.app.game_running = false

    for (var k in GC.app.actors) {
      GC.app.actors[k].stop()
    }

    if (!opts.no_gameover_screen) {
      var bgHeight = GC.app.bgHeight;

      if (scene.usingScore) {
        scene.horCenterText(bgHeight / 2 - DEFAULT_TEXT_HEIGHT, 'Game over!')
        scene.horCenterText(bgHeight / 2, 'Your score was ' + scene.score)
      } else {
        scene.centerText('Game over!')
      }

      GC.app.overlay.onInputSelect = function() {
        delete GC.app.overlay.onInputSelect;
        GC.app.reset()
      }
    }
  }
}

/**
 * mode(name, resetFun, opts = {})
 * ~ name    the name of the mode to set
 * ~ fun     the function to call from reset, whenever the mode resets or begins
 * ~ opts    options to pass to the mode function
 */
scene.mode = function(name, fun, opts) {
  opts = opts || {}
  modes[name] = {
    fun: fun,
    opts: opts
  }
}

/**
 * splash(fun, opts)
 */
scene.splash = function(fun, opts) {
  scene.mode('splash', fun, opts)
}

exports = scene
