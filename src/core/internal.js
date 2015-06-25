
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
  if(a.priority < b.priority) return -1;
  if(a.priority > b.priority) return 1;
  return 0;
};

var fire = function(name) {
  // console.log('Firing:', name);

  var listeners = _listeners[name];
  if (!listeners) {
    return;
  }

  var args = [].slice.call(arguments, 1);

  var scene = window.scene;
  for (var i = 0; i < listeners.length; i++) {
    var listener = listeners[i];
    listener.cb.apply(scene, args);
  }
};


exports = {
  internal: {
    registerListeners: registerListeners,
    registerListener: registerListener,
    fire: fire
  }
};
