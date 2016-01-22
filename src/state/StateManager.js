
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
    /** @type number
        @private */
    this._order = 0;

    /** @type object */
    this.gameData = null;

    // add default gameOver state
    this.add('gameOver', function () {
      scene.addText('Game Over!');
    }, { order: Number.MAX_VALUE - 1, tapToContinue: true });

    // add default final state to automatically restart the game
    this.add('restartGame', function () {
      setTimeout(function () { scene.internal.game.start(); });
    }, { order: Number.MAX_VALUE });
  };

  /**
   * Add new state by name; must provide onEnter function to build the state
   * @param {string}   name
   * @param {function} onEnter
   * @param {object}   [opts]
   * @param {number}   [opts.order] By default, states appear in the order added; this option allows you to specify a different order
   * @param {boolean}  [opts.tapToContinue] Adds a touch handler to automatically proceed to the next state
   * @param {string}   [opts.nextState] Supercedes order to force a specifc state on transition
   */
  this.add = function(name, onEnter, opts) {
    opts = opts || {};
    this._states[name] = {
      name: name,
      onEnter: onEnter,
      order: opts.order !== undefined ? opts.order : this._order++,
      tapToContinue: opts.tapToContinue || false,
      nextState: opts.nextState || '',
      clearOnTransition: opts.clearOnTransition || false
    };
  };

  /**
   * Remove an existing state by name
   * @param {string} name
   */
  this.remove = function(name) {
    delete this._states[name];
  };

  /**
   * Check if a state has been registered for name
   * @param  {string} name
   * @return {boolean}
   */
  this.has = function(name) {
    return !!this._states[name];
  };

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
  this.enter = function(name, runInitializer, clearScene) {
    var warning;
    name = name === undefined ? this._getNextStateName() : name;

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

    var oldData = this._states[this._state];
    var data = this._states[name] || {};
    runInitializer = runInitializer === undefined ? name !== "" : runInitializer;
    clearScene = clearScene || (oldData && oldData.clearOnTransition) || false;

    this._enteringState = true;

    this._runStateExitFunctions();

    if (clearScene) {
      scene.internal.game.reset(null, { skipState: true });
    }

    this._state = name;

    if (runInitializer) {
      var onEnter = data.onEnter;
      if (onEnter) {
        var args = [ this.gameData ];
        // Store extra arguments to pass to state function.
        for (var i = 3; i < arguments.length; i++) {
          args.push(arguments[i]);
        }

        onEnter.apply(null, args);
      };
    }

    data.tapToContinue && this.tapToContinue();

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
   * Shortcut for state transition on user input
   * @param {string} nextState
   */
  this.tapToContinue = function(nextState) {
    scene.screen.onUp(bind(this, function() {
      if (nextState) {
        this.enter(nextState);
      } else {
        this.next();
      }
    }), true);
  };

  /**
   * Transition to the next state
   */
  this.next = function() {
    this.enter(this._getNextStateName());
  };

  /**
   * Return the name of the state to transition to next
   * @private
   */
  this._getNextStateName = function() {
    var index = 0;
    var next = '';
    var currData = this._states[this.currentState];

    // use order by default, superceded by nextState
    if (currData) {
      if (currData.nextState && this.has(currData.nextState)) {
        next = currData.nextState;
      } else {
        index = currData.order + 1;
      }
    }

    // find the next state based on the order property
    var nextIndex = Infinity;
    if (next === '') {
      for (var name in this._states) {
        var data = this._states[name];
        if (data) {
          if (data.order >= index && data.order <= nextIndex) {
            next = name;
            nextIndex = data.order;
          }
        }
      }
    }

    return next;
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
