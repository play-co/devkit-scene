import .TimerManager;
import .Timer;


/** @lends scene */
exports = {

  /**
   * Execute a callback every specified amount of milliseconds. Game dt will be used
   * to determine how long has passed, not system time. Replacement for `setInterval`.
   * @arg {function} callback
   * @arg {number} ms - milliseconds between callback executions
   * @return {Timer} intervalInstance
   */
  addInterval: function(callback, ms) {
    return this.timerManager.addTimer(new Timer(callback, ms, false));
  },

  /**
   * Remove an interval before it has executed. Replacement for `clearInterval`.
   * @arg {Timer} intervalInstance
   */
  removeInterval: function(intervalInstance) {
    return this.timerManager.removeTimer(intervalInstance);
  },

  /**
   * Execute a callback after a specified amount of milliseconds. Callback will only execute once.
   * Game dt will be used to determine how long has passed, not system time. Replacement for `setTimeout`.
   * @arg {function} callback
   * @arg {number}   ms - milliseconds until callback is executed
   * @return {Timer} timeoutInstance
   */
  addTimeout: function(callback, ms) {
    return this.timerManager.addTimer(new Timer(callback, ms, true));
  },

  /**
   * Remove a timeout before it has executed. Replacement for `clearTimeout`.
   * @arg {Timer} timeoutInstance
   */
  removeTimeout: function(timeoutInstance) {
    return this.timerManager.removeTimer(timeoutInstance);
  },

  /**
   * The default manager for scene timers. Add timers to this if you want them automatically managed.
   * @type TimerManager
   */
  timerManager: new TimerManager(),

  __listeners__: [
    {
      event: 'restartGame',
      cb: function() {
        this.timerManager.reset();
      }
    },
    // Tick
    {
      event: 'tickMSec',
      cb: function(dt) {
        this.timerManager.update(dt);
      }
    }
  ]

};
