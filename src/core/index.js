import communityart;
import effects;

import entities.shapes.Line as Line;
import entities.shapes.Rect as Rect;

import scene.state.StateManager as StateManager;

exports = {
  core: {
    _game_running: false,
    // TODO: remove this and use the state management...
    _modes: {},
    // TODO: remove this
    _on_tick: null,

    /** Use the get and set method
     * @var {number} scene._score
     * @private
     * @see scene.getScore
     * @see scene.setScore */
    _score: 0,
    _using_score: false
  },

  /**
   * The state manager is what handles changing game states.
   * @var {StateManager} scene.state
   */
  state: new StateManager(),

  /**
   * There can be only one player. {@link scene.gameOver} is automatically called when the player is destroyed.
   * @var {Actor} scene.player
   * @see scene.addPlayer
   */
  player: null,

  /**
   * The total number of milliseconds that have elapsed since the start of the game.
   * @var {number} scene.totalDt
   */
  totalDt: 0,

  /**
   * The total number of milliseconds that have elapsed since the start of the app.
   * @var {number} scene.totalAppDt
   */
  totalAppDt: 0,

  /**
   * Called every tick with the dt in milliseconds since the last tick.
   * @callback onTickCallback
   * @arg {number} [dt] - Used to normalise game speed based on real time
   */
  /**
   * Register a new tick handler
   * @func scene.onTick
   * @arg {onTickCallback} callback
   */
  // FIXME: this is really bad
  onTick: function(cb) {
    this.core._on_tick = cb;
  },

  /**
   * Calling this function will set {@link scene._score} and update the score view.
   * @func scene.setScore
   * @arg {number} newScore
   */
  setScore: function(score) {
    if (this.core._game_running) {
      this.core._score = score;
      this.core._using_score = true;
      if (this._scoreView) {
        this._scoreView.setText('' + score);
      }
    }
  },

  /**
   * @func scene.addScore
   * @arg {number} amount
   * @see scene.setScore
   */
  addScore: function(add) {
    this.setScore(this.getScore() + add);
  },

  /**
   * @func scene.getScore
   * @returns {number}
   */
  getScore: function() {
    this.core._using_score = true;
    return this.core._score;
  },

  /**
   * When called, this function will restart the game.
   * If scene has been set to use Weeby, calling this will return the user to the Weeby UI.
   * @func scene.gameOver
   * @arg {Object}  [opts]
   * @arg {number}  [opts.delay] - A delay between when this function is called and when the endgame logic is run.
   * @arg {boolean} [opts.noGameoverScreen] - Optionally skip the "Game Over" text.
   */
  gameOver: function(opts) {

    if (this.core._game_running === false ) { return; }

    opts = opts || {};
    opts.delay = opts.delay !== undefined ? opts.delay : 1000;

    this.core._game_running = false;

    var scene = this;
    setTimeout(function () {
      if (scene._useWeeby) {
        weeby.finishGame({ score: scene.getScore() });
      } else {
        if (!opts.noGameoverScreen) {
          var bgHeight = scene.screen.height;

          // TODO: This should be a scene splash ... not random text. Allows the player to set their own game over splash.
          if (scene.core._using_score) {
            scene.addText('Game Over!', { y: bgHeight / 2 - scene.text.DEFAULT_TEXT_HEIGHT });
            scene.addText('Score: ' + scene.core._score, { y: bgHeight / 2 + 10 });
          } else {
            scene.addText('Game Over!');
          }

          scene.screen.onDown(function () {
            setTimeout(function () { GC.app.reset() });
          }, true);
        }
      }
    }, opts.delay);
  },

  /**
   * Set a mode to the given function
   * @method scene.mode
   * @param {String} name - The name of the mode to set
   * @param {function} resetFunction - The function to call from reset, whenever the mode resets or begins
   * @param {Object} [opts] - Options to pass to the mode function
   */
  /**
   * Switches to the given mode
   * @method scene.mode(2)
   * @param {String} name - The name of the mode to switch to
   */
  mode: function(name, fun, opts) {
    if (fun !== undefined) {
      // Set a mode to a function
      opts = opts || {};
      this.core._modes[name] = {
        fun: fun,
        opts: opts
      };
    } else {
      // Change to the given mode
      this.reset(name);
    }
  },

  /**
   * Sets the scene player, makes sure not to override an existing player.
   * @method  scene.addPlayer
   * @param   {String|Object} resource - resource key to be resolved by community art, or opts
   * @param   {Object}        [opts]   - contains options to be applied to the underlying {@link Actor}
   * @returns {View}                   - The newly set player
   * @see scene.addActor
   */
  addPlayer: function(resource, opts) {
    if (this.player) {
      throw new Error('You can only add one player!');
    }

    this.player = this.addActor(resource, opts);
    this.player.onDestroy(function() {
      scene.gameOver();
    });
    return this.player;
  },

  // --- ---- Shortcuts ---- ---- //

  /**
   * Easy access to shape classes
   * @var  {Object} scene.shape
   * @prop {Rect}   scene.shape.Rect
   * @prop {Line}   scene.shape.Line
   */
  shape: {
    Rect: Rect,
    Line: Line
  },

  /**
   * Reset and restart the entire game.
   * @method scene.reset
   */
  reset: function() {
    GC.app.reset();
  },

  __listeners__: [
    {
      event: 'restartUI',
      cb: function() {
        effects.commit();
      }
    },
    {
      event: 'restartGame',
      cb: function() {
        this.player = null;
        this.totalDt = 0;

        // State
        this.state.reset();

        this.core._score = 0;
        this.core._on_tick = null;
      }
    },
    // FIXME: why is state management happening with this _modes thing?
    {
      event: 'restartState',
      cb: function(mode) {
        // Let's reboot the fun!
        var currentMode = this.core._modes[mode]
        currentMode.fun(this.state._gameObject, currentMode.opts);

        this.core._game_running = true;
      }
    },
    // Tick
    {
      event: 'tickMSec',
      cb: function(dt) {
        //  TODO: fix ontick so that it isnt bad
        if (this.core._on_tick) {
          this.core._on_tick(dt);
        }

        this.totalDt += dt;
        this.totaApplDt += dt;
      }
    }
  ]
};
