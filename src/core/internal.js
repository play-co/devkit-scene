import scene.utils.performance as performance;

var _listeners = {};

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

  // show the splash screen
  if (scene.state.has('splash')) {
    scene.internal.game.reset('splash');

    // start the game when you click
    scene.screen.onDown(function() {
      scene.internal.game.reset('game');
    }.bind(this), true);
  } else {
    scene.internal.game.reset();
  }
};

var resetGame = function(mode) {
  performance.start('reset');

  if (mode === undefined) mode = 'game';
  fire('restartUI', mode);
  fire('restartGame', mode);
  fire('restartState', mode);

  performance.stop('reset');
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


exports = {
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
