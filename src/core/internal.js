import scene.utils.performance as performance;

var _listeners = {};
var _isResetting = false;

var registerListeners = function(listeners) {
  if (Array.isArray(listeners)) {
    listeners.forEach(registerListener);
  } else if (typeof listeners === 'object') {
    for (var key in listeners) {
      // use the key as the event name
      if (!Array.isArray(listeners[key])) {
        listeners[key] = [listeners[key]];
      }

      listeners[key].forEach(function(listener) {
        listener.event = key;
        registerListener(listener);
      });
    }
  } else {
    throw new Error('Unknown __listeners__ type: ' + (typeof listeners));
  }
};

var registerListener = function(opts) {
  // console.log('Registering:', opts);
  var ev = opts.event;
  var cb = opts.cb;

  // Validation
  if (!ev || !cb) {
    console.error('opts', opts);
    throw new Error('listener must define event, and opts');
  }

  // Defaults
  // var name = opts.name || 'noname';
  if (opts.priority === undefined) {
    opts.priority = 0;
  }

  // Add to the listener array
  var listeners = _listeners[ev];
  if (!listeners) {
    _listeners[ev] = listeners = [];
  }

  listeners.push(opts);

  // Sort the listener array
  listeners.sort(listenerComparator);
};

var listenerComparator = function(a, b) {
  return a.priority - b.priority;
};

var fire = function(name) {
  // console.log('Firing:', name);

  var listeners = _listeners[name];
  if (!listeners) { return; }

  var args = [].slice.call(arguments, 1);

  var scene = window.scene;
  for (var i = 0, len = listeners.length; i < len; i++) {
    listeners[i].cb.apply(scene, args);
  }
};

var initGame = function() {
  performance.start('init');

  fire('initView');
  fire('initUI');
  fire('initGame');

  performance.stop('init');
};

var startGame = function() {
  scene.performance.dump();
  scene.internal.game.reset();
};

/**
 * @param  mode
 * @param  {Object}  [opts]
 * @param  {Boolean} [opts.skipState] - Don't reset the state mechanisms, only the visual stuff
 */
var resetGame = function(mode, opts) {
  opts = opts || {};
  // Avoid state loops
  if (_isResetting) {
    console.error('Already resetting (call to scene.game.reset while in a reset)');
    return;
  }
  _isResetting = true;

  performance.start('reset');

  fire('restartUI', mode);
  fire('restartGame', mode);
  if (!opts.skipState) {
    fire('restartState', mode);
  }

  performance.stop('reset');
  _isResetting = false;
};

var tickGame = function(dt) {
  performance.start('tick');

  fire('tickMSec', dt);
  // Convert dt into seconds
  dt /= 1000;
  fire('tickSec', dt);
  fire('tickUI', dt);

  performance.stop('tick');
};

/** @lends scene */
exports = {
  /**
   * Internal functionality for working with scene
   * @type {object}
   * @private
   */
  internal: {
    registerListeners: registerListeners,
    registerListener: registerListener,
    fire: fire,

    game: {
      init: initGame,
      start: startGame,
      reset: resetGame,
      tick: tickGame
    }
  }
};
