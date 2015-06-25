import communityart;
import effects;


/**
 * Construct the main scene for the game, this is where all of the gameplay is defined.
 * @namespace scene
 * @version 0.0.3
 * @arg {function} - The function which will initialize a new game scene
 */
scene = function (newGameFunc) {

  scene.mode('default', newGameFunc);

  scene._app = Class(GC.Application, function() {
    this.initUI = function() {
      scene.internal.fire('init', this);
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

    /**
     * reset
     */
    this.reset = function(mode) {
      if (mode === undefined) mode = 'default';

      // UI
      scene.ui.reset();

      // Core
      effects.commit();

      // Animation
      scene.clearAnimations();

      // UI
      // TODO: Why is there an updatescreendimensions called at reset and init?
      scene.updateScreenDimensions();
      scene.screen.reset();
      scene.background.reset();

      // Group
      scene.group.destroy(false);

      // Core
      scene.player = null;

      // Camera
      scene.camera.stopFollowing();
      scene.camera.x = 0;
      scene.camera.y = 0;

      // Core
      scene.totalDt = 0;

      // Timer
      scene.timerManager.reset();

      // Core
      for (var i in scene.groups) {
        scene.groups[i].destroy(false);
      }

      // UI
      for (var k in scene.extraViews) {
        scene.extraViews[k].removeFromSuperview();
      }

      delete scene._scoreView;
      scene.background.destroy();

      // Collision
      scene.collisions.reset();

      // UI
      scene.stage.removeAllSubviews();

      // Clear the tallies
      scene.extraViews = []; // UI
      scene.groups = []; // Core
      scene.core._score = 0; // Core
      scene.core._on_tick = null; // Core

      // State
      scene.state.reset();

      // Let's reboot the fun!
      var currentMode = scene.core._modes[mode]
      currentMode.fun(scene.state._gameObject, currentMode.opts);

      // UI
      scene.background.reloadConfig();

      // The curtain rises, and Act 1 begins!
      scene.core._game_running = true;
    }

    /**
     * tick tock
     */
    this.tick = function(dt) {
      if (scene.core._on_tick) {
        scene.core._on_tick(dt);
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
      scene.stage.style.x = -scene.camera.x;
      scene.stage.style.y = -scene.camera.y;
      if (scene.camera.following) {
        scene.background.scrollTo(-scene.camera.x, -scene.camera.y);
      }
    }
  });

  return scene._app;

};


/////////////////////////////////////////////////
/////////////////////////////////////////////////


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
        scene.warn('[scene] Module export collision: ', typeof module[key], chain.join('.'), module[key]);
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
