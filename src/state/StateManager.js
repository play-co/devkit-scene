
exports = Class(function() {

  /**
   * @class StateManager
   */
  this.init = function() {
    this._state = "";
    this._states = {};
    this._exitFunctions = [];
    this._enteringState = false;
    this._gameObject = {};
  };

  /**
    * @arg {string} stateName
    * @arg {stateSetupFn} setupFn
    */
  this.add = function(name, initializer) {
    this._states[name] = initializer;
  };

  /**
   * Check if a state has been registered for name
   * @method StateManager#has
   * @param  {string} name
   * @return {Boolean}
   */
  this.has = function(name) {
    return !!this._states[name];
  }

  this.reset = function() {
    if (this._state !== "") { this.enter(""); }
    this._gameObject = {};
  };

  /**
    * You can only register exit functions inside the state function currently running.
    * All onExitStates are cleared on a state change
    * @arg {teardownFn} teardownFn
    */
  /**
    * NOTE: Cannot set states during a state change !!!!
    * @arg {string} stateName
    * @arg {boolean=true} [runSetupFunction]
    */

  // TODO: Implement clearScene
  this.enter = function(name, runInitializer, clearScene) {
    var warning;

    if (this._state === name) {
      warning = "WARNING: Trying to enter state '" + name + "' when already in this state. Ignoring.";
    } else if (this._enteringState) {
      warning = "WARNING: Trying to enter state '" + name + "'' while in the process of entering another state. Ignoring."
    } else if (name !== "" && !this._states[name]) {
      warning = "WARNING: Cannot enter state '" + name + "', state not found. Ignoring.";
    }

    if (warning) {
      console.log(warning);
      return;
    }

    runInitializer = runInitializer === undefined ? name !== "" : runInitializer;
    clearScene = clearScene || false;

    this._enteringState = true;

    var args = [ this._gameObject ];
    // Store extra arguments to pass to state function.
    for (var i = 3; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    this._runStateExitFunctions();

    this._state = name;

    if (runInitializer) {
      this._states[name].apply(null, args);
    }

    this._enteringState = false;
  };

  this.onExit = function(exitFunction) {
    this._exitFunctions.push(exitFunction);
  };

  this._runStateExitFunctions = function() {
    for (var i = 0; i < this._exitFunctions.length; i++ ) {
      this._exitFunctions[i]();
    }
    this._exitFunctions.length = 0;
  };

  Object.defineProperty(this, "currentState", {
    get: function() { return this._state; }
  });

});