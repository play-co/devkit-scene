import .StateManager;


/** @lends scene */
exports = {
  /**
   * The state manager is what handles changing game states.
   * @type StateManager
   */
  state: new StateManager(),

  /**
   * Set a mode to the given function
   * @method scene.mode
   * @param  {string} name            The name of the mode to set
   * @param  {function} resetFunction The function to call from reset, whenever the mode resets or begins
   * @param  {object} [opts]          Options to pass to the mode function
   */
  /**
   * Switches to the given mode
   * @method scene.mode(2)
   * @param  {string} name            The name of the mode to switch to
   */
  mode: function(name, func, opts) {
    if (func !== undefined) {
      this.state.add(name, func);
    } else {
      // Change to the given mode
      this.state.enter(name, true);
    }
  },

  __listeners__: [
    {
      event: 'restartGame',
      cb: function() {
        this.state.reset();
      }
    },
    {
      event: 'restartState',
      cb: function(mode) {
        this.state.enter(mode, true);
      }
    }
  ]

};
