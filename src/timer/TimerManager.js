
/** @lends TimerManager */
exports = Class(function() {

  /**
   * Manages {@link Timer} instances.
   * @constructs
   */
  this.init = function() {
    /** @type Timer[] */
    this.timers = null;

    this.reset();
  };

  /** Reset the timers */
  this.reset = function() {
    this.timers = [];
  };

  /**
   * Update tracked timers, remove complete timers.
   * @arg  {number} dt
   */
  this.update = function(dt) {
    for (var i = this.timers.length - 1; i >= 0; i--) {
      var timer = this.timers[i];
      var result = timer.update(dt);

      if (result) {
        this._removeTimer(i);
      }
    }
  };

  /**
   * Add a new timer to the manager to be automatically updated and removed when appropriate.
   * @arg     {Timer} timer
   * @returns {Timer} timer
   */
  this.addTimer = function(timer) {
    timer.setManager(this);
    this.timers.push(timer);
    return timer;
  };

  /**
   * Remove a timer from the manager.
   * @arg {Timer} timer
   */
  this.removeTimer = function(timer) {
    var index = this.timers.indexOf(timer);
    if (index >= 0) {
      this._removeTimer(index);
    }
  };

  /**
   * Remove a timer by index
   * @private
   * @arg {number} timerIndex
   */
  this._removeTimer = function(timerIndex) {
    this.timers.splice(timerIndex, 1);
  };
});
