import .TouchInstance;

/**
 * @class TouchManager
 */
exports = Class(function() {

  /** @var {Number} TouchManager.MAX_TOUCH_COUNT */
  this.MAX_TOUCH_COUNT = 10;

  this.init = function() {
    // Populate instances
    this.touchInstances = [];
    for (var i = 0; i < this.MAX_TOUCH_COUNT; i++) {
      var touchInstance = new TouchInstance(this, i);
      this.touchInstances[i] = touchInstance;
      touchInstance.reset();
    }
  };

  this.reset = function() {
    var instances = this.touchInstances;
    for (var i = 0; i < instances.length; i++) {
      instances[i].reset();
    }
  };

  this.getTouch = function(index) {
    // On desktop -1 is the mouse
    if (index === -1) {
      index = 0;
    }
    return this.touchInstances[index];
  };

  // ---- Handlers - internal to scene ---- //

  this.downHandler = function(event, point) {
    var touchInstance = this.getTouch(event.id);
    if (touchInstance) {
      touchInstance.downHandler(event, point);
    }
  };

  this.upHandler = function(event, point) {
    var touchInstance = this.getTouch(event.id);
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
