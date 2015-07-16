
/** @lends StateManager */
exports = Class(function() {

  /**
   * @constructs
   */
  this.init = function() {
    /** @type string
        @private */
    this._state = '';
    /** @type object
        @private */
    this._states = {};
    /** @type array
        @private */
    this._exitFunctions = [];
    /** @type boolean
        @private */
    this._enteringState = false;

    /** @type object */
    this.gameData = null;
  };

  /**
   * Add a new state by name
   * @param {string}       stateName
   * @param {stateSetupFn} setupFn
   */
  this.add = function(name, initializer) {
    this._states[name] = initializer;
  };

  /**
   * Check if a state has been registered for name
   * @param  {string} name
   * @return {boolean}
   */
  this.has = function(name) {
    return !!this._states[name];
  }

  /**
   * Reset the game data and enter the default state
   */
  this.reset = function() {
    this.gameData = {};
    if (this._state !== '') {
      this.enter('');
    }
  };

  /**
   * NOTE: Cannot set states during a state change!!!
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

    var args = [ this.gameData ];
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

  /**
   * You can only register exit functions inside the state function currently running.
   * All onExitStates are cleared on a state change
   * @arg {teardownFn} teardownFn
   */
  this.onExit = function(exitFunction) {
    this._exitFunctions.push(exitFunction);
  };

  /**
   * Run all of the exit functions, then reset the array
   * @private
   */
  this._runStateExitFunctions = function() {
    for (var i = 0; i < this._exitFunctions.length; i++ ) {
      this._exitFunctions[i]();
    }
    this._exitFunctions.length = 0;
  };

  /**
   * @var {string} StateManager#currentState
   * @readonly
   */
  Object.defineProperty(this, 'currentState', {
    get: function() { return this._state; }
  });

});