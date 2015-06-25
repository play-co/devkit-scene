import .TimerManager;

exports = {
  /**
   * Execute a callback every specified amount of milliseconds. Game dt will be used
   * to determine how long has passed, not system time. Replacement for `setInterval`.
   * @func scene.addInterval
   * @arg {function} callback
   * @arg {number} ms - milliseconds between callback executions
   * @returns {Timer} intervalInstance
   */
  addInterval: function(callback, ms) {
    return scene.timerManager.addTimer(new Timer(callback, ms, false));
  },

  /**
   * Remove an interval before it has executed. Replacement for `clearInterval`.
   * @func scene.removeInterval
   * @arg {Timer} intervalInstance
   */
  removeInterval: function(intervalInstance) {
    return scene.timerManager.removeTimer(intervalInstance);
  },

  /**
   * Execute a callback after a specified amount of milliseconds. Callback will only execute once.
   * Game dt will be used to determine how long has passed, not system time. Replacement for `setTimeout`.
   * @func scene.addTimeout
   * @arg {function} callback
   * @arg {number}   ms - milliseconds until callback is executed
   * @returns {Timer} timeoutInstance
   */
  addTimeout: function(callback, ms) {
    return scene.timerManager.addTimer(new Timer(callback, ms, true));
  },

  /**
   * Remove a timeout before it has executed. Replacement for `clearTimeout`.
   * @func scene.removeTimeout
   * @arg {Timer} timeoutInstance
   */
  removeTimeout: function(timeoutInstance) {
    return scene.timerManager.removeTimer(timeoutInstance);
  },

  /**
   * The default manager for scene timers. Add timers to this if you want them automatically managed.
   * @var {TimerManager} scene.timerManager
   */
  timerManager: new TimerManager()
};
