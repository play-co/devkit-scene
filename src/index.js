/**
 * Construct the main scene for the game, this is where all of the gameplay is defined.
 * @namespace scene
 * @version 0.0.4
 * @arg {function} - The function which will initialize a new game scene
 */
scene = function (newGameFunc) {
  scene.mode('default', newGameFunc);
  return scene.theGame();
};

scene._makeApp = function() {
  return Class(GC.Application, function() {
    var fire = scene.internal.fire;

    this.initUI = function() {
      fire('initView', this);
      fire('initUI');
      fire('initGame');
    }

    this.launchUI  =
    this.startGame = function() {
      // show the splash screen
      if (scene.core._modes.splash) {
        this.reset('splash');

        // start the game when you click
        scene.screen.onDown(function() {
          this.reset('default');
        }.bind(this), true);
      } else {
        this.reset();
      }
    }

    this.reset = function(mode) {
      if (mode === undefined) mode = 'default';
      fire('restartUI', mode);
      fire('restartGame', mode);
      fire('restartState', mode);
    }

    this.tick = function(dt) {
      fire('tickMSec', dt);
      // Convert dt into seconds
      dt /= 1000;
      fire('tickSec', dt);
      fire('tickUI', dt);
    }
  });
};

scene.theGame = function() {
  if (!scene._app) {
    scene._app = scene._makeApp();
  }

  return scene._app;
};

// // Internal Module Importing // //

var SCENE_MODULES = [
  jsio('import .core.internal'),
  jsio('import .core'),
  jsio('import .utils'),
  jsio('import .animation'),
  jsio('import .collision'),
  jsio('import .accelerometer'),
  jsio('import .ui'),
  jsio('import .actor'),
  jsio('import .group'),
  jsio('import .camera'),
  jsio('import .spawner'),
  jsio('import .timer'),
  jsio('import .audio'),
  jsio('import .weeby'),
];

// // Logging // //

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

// // Module Registration // //

scene.registerModule = function(module, parentObj, parentChain) {
  parentObj = parentObj || scene;
  parentChain = parentChain || ['scene'];

  for (var key in module) {
    var chain = parentChain.concat([key]);

    // Check for special cases
    if (key === '__listeners__') {
      scene.internal.registerListeners(module[key]);
      continue;
    }

    // If exists and is function
    if (parentObj[key]) {
      if (typeof parentObj[key] === 'object') {
        // Try to merge the objects
        scene.registerModule(module[key], parentObj[key], chain);
      } else {
        scene.warn('Module export collision: ', typeof module[key], chain.join('.'), module[key]);
      }
      continue;
    }

    scene.log('Adding ' + chain.join('.'));
    if (typeof parentObj[key] === 'function' && chain.length === 1) {
      parentObj[key] = bind(module[key], scene);
    } else {
      parentObj[key] = module[key];
    }
  }
}
SCENE_MODULES.forEach(function(module) {
  scene.registerModule(module);
});

// // Final Exports // //

exports = scene;
