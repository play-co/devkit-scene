import scene.utils.Logger as Logger;
var log = new Logger('TouchManager', SCENE_CONFIG.logging.touchManager);

import .TouchInstance;

/** @lends TouchManager */
exports = Class(function() {

  /** @var {number} TouchManager.MAX_TOUCH_COUNT */
  this.MAX_TOUCH_COUNT = 10;

  /** @var {string[]} TouchManager.TOUCH_TYPES */
  this.TOUCH_TYPES = ['down', 'move', 'up'];

  /** @constructs */
  this.init = function() {
    /** @type {TouchInstance[]} */
    this.touchInstances = null;

    /**
     * because safari doesnt give logical IDs
     * dont reset this, touch events can span resets
     * @type {object}
     * @private
     */
    this._realIdMap = {};

    this._populateInstances();
  };

  /**
   * Reset the touchInstances array with new {@link TouchInstance}s
   * @private
   */
  this._populateInstances = function() {
    this.touchInstances = [];
    for (var i = 0; i < this.MAX_TOUCH_COUNT; i++) {
      var touchInstance = new TouchInstance(this, i);
      this.touchInstances[i] = touchInstance;
      touchInstance.reset();
    }
  };

  /**
   * Reset all items in touchInstances
   */
  this.reset = function() {
    var instances = this.touchInstances;
    for (var i = 0; i < instances.length; i++) {
      instances[i].reset();
    }
  };

  /**
   * Get a touchInstance using the real touchId (assigned by the browser)
   * @param  {number} realId
   */
  this.getTouch = function(realId) {
    if (this._realIdMap[realId]) {
      return this._realIdMap[realId];
    }

    // none found
    return null;
  };

  /**
   * Get the first touchInstance that is not currently active (down). May return null if none are available.
   * @private
   * @return {TouchInstance}
   */
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

  /**
   * Get the first available touch instance, set its realId based on event.id, add it to the realMap
   * @ignore
   * @param  {MouseEvent}    event
   * @param  {Point}         point
   */
  this.downHandler = function(event, point) {
    var touchInstance = this._firstInactiveInstance();
    if (!touchInstance) {
      log.warn('Max touches reached, no more free!', event.type, event.id);
      return;
    }

    log.log('downHandler: ' + touchInstance.id);
    this._realIdMap[event.id] = touchInstance;
    touchInstance.downHandler(event, point);
  };

  /**
   * Get the matching touch for the event.id, clear it in the realMap
   * @ignore
   * @param  {MouseEvent}    event
   * @param  {Point}         point
   */
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

  /**
   * Get the matching touch for the event.id, update only
   * @ignore
   * @param  {MouseEvent}    event
   * @param  {Point}         point
   */
  this.moveHandler = function(event, point) {
    var touchInstance = this.getTouch(event.id);

    if (touchInstance) {
      touchInstance.moveHandler(event, point);
    }
  };

  /**
   * Get the matching touch for the event.id, update only
   * @ignore
   * @param  {MouseEvent}    event
   * @param  {Point}         point
   */
  this.tapHandler = function(event, point) {
    var touchInstance = this.getTouch(event.id);
    if (touchInstance) {
      touchInstance.tapHandler(event, point);
    }
  };

});
