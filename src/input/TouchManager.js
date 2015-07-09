import scene.utils.Logger as Logger;
var log = new Logger('TouchManager', SCENE_CONFIG.logging.touchManager);

import .TouchInstance;

/**
 * @class TouchManager
 */
exports = Class(function() {

  /** @var {Number} TouchManager.MAX_TOUCH_COUNT */
  this.MAX_TOUCH_COUNT = 10;

  this.TOUCH_TYPES = ['down', 'move', 'up'];

  this.init = function() {
    // Populate instances
    this.touchInstances = [];
    for (var i = 0; i < this.MAX_TOUCH_COUNT; i++) {
      var touchInstance = new TouchInstance(this, i);
      this.touchInstances[i] = touchInstance;
      touchInstance.reset();
    }

    // because safari doesnt give logical IDs
    // dont reset this, touch events can span resets
    this._realIdMap = {};
  };

  this.reset = function() {
    var instances = this.touchInstances;
    for (var i = 0; i < instances.length; i++) {
      instances[i].reset();
    }
  };

  this.getTouch = function(realId) {
    if (this._realIdMap[realId]) {
      return this._realIdMap[realId];
    }

    // none found
    return null;
  };

  this._firstInactiveInstance = function() {
    for (var i = 0; i < this.touchInstances.length; i++) {
      var instance = this.touchInstances[i];
      if (!instance.isDown) {
        return instance;
      }
    }

    return null;
  }

  // ---- Handlers - internal to scene ---- //

  this.downHandler = function(event, point) {
    // Get the first available touch instance, set its realId
    var touchInstance = this._firstInactiveInstance();
    if (!touchInstance) {
      log.warn('Max touches reached, no more free!', event.type, event.id);
      return;
    }

    log.log('downHandler: ' + touchInstance.id);
    this._realIdMap[event.id] = touchInstance;
    touchInstance.downHandler(event, point);
  };

  this.upHandler = function(event, point) {
    var touchInstance = this.getTouch(event.id);
    this._realIdMap[event.id] = undefined;

    if (!touchInstance) {
      log.error('No touch instance for touch id: ' + event.id);
      return;
    }

    log.log('upHandler: ' + touchInstance.id);
    if (touchInstance) {
      touchInstance.upHandler(event, point);
    }
  };

  this.moveHandler = function(event, point) {
    var touchInstance = this.getTouch(event.id);

    if (touchInstance) {
      touchInstance.moveHandler(event, point);
    }
  };

  this.tapHandler = function(event, point) {
    var touchInstance = this.getTouch(event.id);
    if (touchInstance) {
      touchInstance.tapHandler(event, point);
    }
  };

});
