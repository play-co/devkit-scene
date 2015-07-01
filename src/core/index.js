//import communityart;
import effects;

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

exports = {

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
  onTick: function(cb) {
    _onTickHandlers.push(cb);
  },

  /**
   * Calling this function will set {@link scene._score} and update the score view.
   * @func scene.setScore
   * @arg {number} newScore
   */
  setScore: function(score) {
    if (_game_running) {
      _score = score;
      _using_score = true;
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
    _using_score = true;
    return _score;
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

    if (_game_running === false ) { return; }

    opts = opts || {};
    opts.delay = opts.delay !== undefined ? opts.delay : 1000;

    _game_running = false;

    setTimeout(function () {
      if (this.weebyData) {
        this.weeby.finishGame({ score: this.getScore() });
        scene.mode('weeby');
      } else {
        if (!opts.noGameoverScreen) {
          var bgHeight = this.screen.height;

          // TODO: This should be a scene splash ... not random text. Allows the player to set their own game over splash.
          if (_using_score) {
            this.addText('Game Over!', { y: bgHeight / 2 - this.text.DEFAULT_TEXT_HEIGHT });
            this.addText('Score: ' + _score, { y: bgHeight / 2 + 10 });
          } else {
            this.addText('Game Over!');
          }

          this.screen.onDown(function () {
            setTimeout(function () { scene.internal.game.start(); });
          }, true);
        }
      }
    }.bind(this), opts.delay);
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
        _onTickHandlers = [];

        this.player = null;
        this.totalDt = 0;

        _score = 0;
      }
    },
    {
      event: 'restartState',
      cb: function(mode) {
        _game_running = true;
      }
    },
    // Tick
    {
      event: 'tickMSec',
      cb: function(dt) {
        //  TODO: fix ontick so that it isnt bad
        _onTickHandlers.forEach(function(handler) {
          handler(dt);
        });

        this.totalDt += dt;
        this.totaApplDt += dt;
      }
    }
  ]
};
