import scene.config;

import scene.utils.performance as performance;
import scene.utils.Logger as Logger;

/**
 * Construct the main scene for the game, this is where all of the gameplay is defined.
 * @namespace scene
 * @global scene
 * @version 0.0.4
 * @arg {function} - The function which will initialize a new game scene
 */
var scene = window.scene = function (newGameFunc) {
  scene.mode('game', newGameFunc);
  return scene._appClass;
};

/**
 * This is a fully functional replacement for Application.js.  It is what allows the user
 * to say `exports = scene(...)`
 */
scene._appClass = Class(GC.Application, function(supr) {
  this.init = function() {
    supr(this, 'init', arguments);
    scene.app = this;

    var internalGame = scene.internal.game;

    this.initUI   = internalGame.init;
    this.launchUI = internalGame.start;
    this.reset    = internalGame.reset;
    this.tick     = internalGame.tick;
  };
});

// // Internal Module Importing // //

/**
 * All scene modules should be loaded here.
 * NO scene modules should attach things to the global scene object directly.
 */
var SCENE_MODULES = [
  jsio('import .core.internal'),
  jsio('import .core'),
  jsio('import .assetregistry'),
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

/**
 * A global logger to be used for debugging.  Will only output `log` calls if verbose is set.
 * @var {Logger} scene.log
 */
scene.log = new Logger('scene', SCENE_CONFIG.logging.scene);
scene.log.log('Logging now ready');
scene.performance = performance;

// // Module Registration // //

/**
 * Used to add functionality to the global `scene` object.  Will automatically merge objects,
 * and throws an error when there is a collision.
 * @method scene.registerModule
 * @param  {Class}        module        Class obtained through `jsio(`import ...`)`
 * @param  {parentObj}    [parentObj]   Do not set, used for recursion
 * @param  {string[]}     [parentChain] Do not set, used for recursion
 */
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
        scene.log.error('Module export collision: ', typeof module[key], chain.join('.'), module[key]);
        throw new Error('module export collision');
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
