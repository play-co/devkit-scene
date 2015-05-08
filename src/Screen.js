import .Actor;
import entities.shapes.Rect as Rect;

/**
  * @class Screen
  */
exports = Class(Rect, function(supr) {

  this.init = function(width, height) {
    var suprOpts = {
      width: width,
      height: height
    };
    supr(this, "init", [suprOpts]);

    this.resetTouches();
  };

  Object.defineProperties(this, {
    midX: { get: function() { return this.width * 0.5; } },
    midY: { get: function() { return this.height * 0.5; } }
  });

  this.resetTouches = function() {
    this.onTouchCallbacks = [];
    this.onTapCallbacks = [];
    this.singleTouchCallbacks = [];
    this.offTouchCallbacks = [];
    this.activeTouches = {};
  };

  // TODO: move this to an event system instead of a bunch of fixed functions
  this.onTouch = function(cb) {
    return this.onTouchCallbacks.push(cb) - 1;
  };

  /**
    * @alias scene.onTap
    * @arg {function} callback
    * @returns {function} callback
    */
  this.onTap = function(cb) {
    this.onTapCallbacks.push(cb);
    return cb;
  };

  /**
    * @alias scene.removeOnTap
    * @arg {function} callback - The callback used with {@link scene.onTap}
    */
  this.removeOnTap = function(cb) {
    var i = this.onTapCallbacks.indexOf(cb);
    if (i >= 0) {
      this.onTapCallbacks.splice(i, 1);
    }
  };

  this.removeOnTouch = function(cb) {
    var i = this.onTouchCallbacks.indexOf(cb);
    if (i >= 0) {
      this.onTouchCallbacks.splice(i, 1);
    }
  };

  this.inputStartHandler = function(event, point) {
    var i;
    for (i in this.onTouchCallbacks) {
      this.onTouchCallbacks[i](event.id, point);
    }
    for (i in this.onTapCallbacks) {
      this.onTapCallbacks[i](event.id, point);
    }
    while (this.singleTouchCallbacks.length > 0) {
      this.singleTouchCallbacks.shift()(event.id, point);
    }
    this.activeTouches[event.id] = { x: point.x, y: point.y };
  };

  this.onTouchMove = function(cb) {
    return this.touchMoveCallbacks.push(cb) - 1;
  };

  this.removeOnTouchMove = function(cb) {
    var i = this.touchMoveCallbacks.indexOf(cb);
    if (i >= 0) {
      this.touchMoveCallbacks.splice(i, 1);
    }
  };

  this.inputMoveHandler = function(event, point) {
    for (var i in this.onTouchCallbacks) {
      this.onTouchCallbacks[i](event.id, point);
    }
    var existingTouch = this.activeTouches[event.id];
    if (existingTouch) {
      existingTouch.x = point.x
      existingTouch.y = point.y;
    }
  };

  this.onTouchOnce = function(cb) {
    return this.singleTouchCallbacks.push(cb) - 1;
  };

  this.removeOnTouchOnce = function(index) {
    this.singleTouchCallbacks.splice(index, 1);
  };

  this.offTouch = function(cb) {
    return this.offTouchCallbacks.push(cb) - 1;
  };

  this.removeOffTouch = function(cb) {
    var i = this.offTouchCallbacks.indexOf(cb);
    if (i >= 0) {
      this.offTouchCallbacks.splice(i, 1);
    }
  };

  this.inputStopHandler = function(event, point) {
    for (var i in this.offTouchCallbacks) {
      this.offTouchCallbacks[i](event.id, point);
    }
    this.activeTouches[event.id] = null;
  };

  this.getTouch = function(index) {
    index = index || -1; // Default is mouse
    return this.activeTouches[index];
  };

});
