
/** @lends Timer */
exports = Class(function() {

  /**
    * @constructs
    * @arg {function} callback
    * @arg {number}   ms
    * @arg {boolean}  [singleCall] If the timer should only fire once.
    */
  this.init = function(callback, ms, singleCall) {
    /** @type function */
    this.callback = callback;
    /** @type number */
    this.ms = Math.max(ms, 1);
    /** @type boolean */
    this.singleCall = singleCall || false;

    /** @type number
        @private */
    this._msCounter = 0;
    /** @type number
        @private */
    this._callCount = 0;
    /** @type TimerManager
        @private */
    this._manager = null;
  };

  /**
   * Set the timer's manager.  Remove from the current manager if there is one.
   * @arg {TimerManager} manager
   */
  this.setManager = function(manager) {
    if (this._manager) {
      this._manager.removeTimer(this);
    }

    this._manager = manager;
  };

  /**
   * @arg     {number}  dt
   * @returns {boolean} isTimerComplete
   */
  this.update = function(dt) {
    this._msCounter += dt;

    while (this._msCounter > this.ms) {
      this._msCounter -= this.ms;

      var result = this.callback(this._callCount);
      if (this.singleCall || result) {
        return true;
      }

      this._callCount++;
    }

    return false;
  };

  /**
   * If the timer is tracked by a manager, it will be removed from that manager.
   */
  this.destroy = function() {
    if (this._manager) {
      this._manager.removeTimer(this);
    }
  };

});
