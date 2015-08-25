import effects;
import ui.resource.loader as loader;
import entities.shapes.Line as Line;
import entities.shapes.Rect as Rect;

var _onTickHandlers = [];

/** Use the get and set method
 * @var {number} _score
 * @private
 * @see scene.getScore
 * @see scene.setScore */
var _score = 0;

var _using_score = false;
var _game_running = false;

/** @lends scene */
exports = {

  /**
   * There can be only one player. {@link scene.gameOver} is automatically called when the player is destroyed.
   * @type Actor
   * @see scene.addPlayer
   */
  player: null,

  /**
   * The total number of milliseconds that have elapsed since the start of the game.
   * @type number
   */
  totalDt: 0,

  /**
   * The total number of milliseconds that have elapsed since the start of the app.
   * @type number
   */
  totalAppDt: 0,

  /**
   * Called every tick with the dt in milliseconds since the last tick.
   * @callback onTickCallback
   * @param    {number} [dt] - Used to normalise game speed based on real time
   */
  /**
   * Register a new tick handler
   * @param  {onTickCallback} callback
   */
  onTick: function (cb) {
    _onTickHandlers.push(cb);
  },

  /**
   * Preload a set of image / sound resources into memory
   * @param {string|string[]} resources - A string or array of strings referencing assets or directories of assets to preload
   * @param {function} [cb] - A callback function to call once the preloading is completed
   * @param {object} [opts] - A few options to modify preloading behavior
   * @param {number} [opts.minDelay] - Allow a minimum amount of time to pass before the callback fires
   */
  preload: function (resources, cb, opts) {
    opts = opts || {};

    // wrap in setTimeouts for safest preloading, new images render a tick etc
    var start = Date.now();
    setTimeout(function () {
      loader.preload(resources, function () {
        var elapsed = Date.now() - start;
        setTimeout(function () {
          cb && cb();
        }, Math.max(0, (opts.minDelay || 0) - elapsed));
      });
    }, 0);
  },

  /**
   * Calling this function will set the score and update the score view.
   * @param {number} newScore
   */
  setScore: function (score) {
    if (_game_running) {
      _score = score;
      _using_score = true;
      if (this._scoreView) {
        this._scoreView.setText('' + score);
      }
    }
  },

  /**
   * Add an amount to the current score (using {@link scene.setScore})
   * @param {number} amount
   * @see scene.setScore
   */
  addScore: function (add) {
    this.setScore(this.getScore() + add);
  },

  /**
   * @returns {number}
   */
  getScore: function () {
    _using_score = true;
    return _score;
  },

  /**
   * When called, this function will restart the game.
   * If scene has been set to use Weeby, calling this will return the user to the Weeby UI.
   * @method scene.gameOver
   * @param  {object}  [opts]
   * @param  {number}  [opts.delay] - A delay between when this function is called and when the endgame logic is run.
   * @param  {boolean} [opts.noGameoverScreen] - Optionally skip the "Game Over" text.
   */
  gameOver: function (opts) {

    if (_game_running === false ) { return; }

    opts = opts || {};
    opts.delay = opts.delay !== undefined ? opts.delay : 1000;

    _game_running = false;

    setTimeout(function () {
      if (this.weebyData) {
        weeby.finishGame({ score: this.getScore() });
      } else {
        scene.state.enter('gameOver');
      }
    }.bind(this), opts.delay);
  },

  /**
   * Sets the scene player, makes sure not to override an existing player
   * @param {object} [opts] - options applied to the {@link Actor}
   * @returns {Actor} - A special instance of Actor representing the player
   * @see scene.addActor
   */
  addPlayer: function (opts) {
    if (this.player) { throw new Error('You can only add one player!'); }

    this.player = this.addActor(opts);
    this.player.onDestroy(function () { scene.gameOver(); });
    return this.player;
  },

  // --- ---- Shortcuts ---- ---- //

  /**
   * Easy access to shape classes
   * @type object
   * @property {Rect}   scene.shape.Rect
   * @property {Line}   scene.shape.Line
   */
  shape: {
    Rect: Rect,
    Line: Line
  },

  /**
   * Reset and restart the entire game.
   * @method scene.reset
   */
  reset: function () {
    GC.app.reset();
  },

  __listeners__: [
    {
      event: 'restartUI',
      cb: function () {
        effects.commit();
      }
    },
    {
      event: 'restartGame',
      cb: function () {
        _onTickHandlers = [];

        this.player = null;
        this.totalDt = 0;

        _score = 0;
      }
    },
    {
      event: 'restartState',
      cb: function (mode) {
        _game_running = true;
      }
    },
    // Tick
    {
      event: 'tickMSec',
      cb: function (dt) {
        //  TODO: fix ontick so that it isnt bad
        _onTickHandlers.forEach(function (handler) {
          handler(dt);
        });

        this.totalDt += dt;
        this.totaApplDt += dt;
      }
    }
  ]
};
