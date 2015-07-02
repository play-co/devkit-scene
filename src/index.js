import scene.config;

import scene.utils.performance as performance;
import scene.utils.Logger as Logger;

/**
 * Construct the main scene for the game, this is where all of the gameplay is defined.
 * @namespace scene
 * @version 0.0.4
 * @arg {function} - The function which will initialize a new game scene
 */
var scene = window.scene = function (newGameFunc) {
  scene.mode('game', newGameFunc);
  return scene._appClass;
};

scene._appClass = Class(GC.Application, function(supr) {
  this.init = function() {
    supr(this, 'init', arguments);
    scene.app = this.rootView;

    var internalGame = scene.internal.game;

    this.initUI   = internalGame.init;
    this.launchUI = internalGame.start;
    this.reset    = internalGame.reset;
    this.tick     = internalGame.tick;
  };
});

// // Internal Module Importing // //

var SCENE_MODULES = [
  jsio('import .core.internal'),
  jsio('import .core'),
  jsio('import .state'),
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

scene.log = new Logger('scene', SCENE_CONFIG.logging.scene);
scene.log.log('Logging now ready');
scene.performance = performance;
scene.weeby = weeby;

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
        scene.log.warn('Module export collision: ', typeof module[key], chain.join('.'), module[key]);
      }
      continue;
    }

    scene.log.log('Adding ' + chain.join('.'));
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
