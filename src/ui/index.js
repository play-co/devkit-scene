import device;

import ui.View as View;
import ui.ImageView as ImageView;
import ui.SpriteView as SpriteView;
import ui.ScoreView as ScoreView;
import ui.TextView as TextView;

import communityart;

import scene.ui.BaseView as BaseView;
import scene.ui.Background as Background;
import scene.ui.UIView as UIView;
import scene.ui.Screen as Screen;
import scene.ui.SceneScoreView as SceneScoreView;
import scene.ui.SceneText as SceneText;
import scene.ui.ScaleManager as ScaleManager;


var DEFAULT_SCREEN_WIDTH = 576;
var DEFAULT_SCREEN_HEIGHT = 1024;


/** @lends scene */
exports = {

  /**
   * Values to apply to text added to the game using scene
   * @type object
   * @property {number} DEFAULT_TEXT_WIDTH
   * @property {number} DEFAULT_TEXT_HEIGHT
   * @property {string} color see {@link scene.setTextColor}
   * @property {string} font see {@link scene.setTextFont}
   */
  text: {
    DEFAULT_TEXT_WIDTH: 350,
    DEFAULT_TEXT_HEIGHT: 75,
    color: '#FFF',
    font: 'Arial'
  },

  /**
   * Add a background layer to your game
   * @param {object} opts
   * @see Background#addLayer
   */
  addBackground: function (opts) {
    return this.background.addLayer(opts);
  },

  /**
   * Displays text
   * @func scene.addText
   * @arg {string} text
   * @arg {object} [opts] contains options to be applied to {@link TextView}
   * @returns {TextView}
   */
  /**
   * @func scene.addText(2)
   * @arg {string} text
   * @arg {number} x
   * @arg {number} y
   * @arg {object} [opts] contains options to be applied to {@link SceneText}
   * @returns {SceneText}
   */
  addText: function (text, x, y, opts) {
    opts = opts || {};

    if (typeof x === 'object') {
      // Function type 1
      opts = x;
    } else if (typeof x === 'number' && typeof y === 'number') {
      // Function type 2
      opts.x = opts.x !== undefined ? opts.x : x;
      opts.y = opts.y !== undefined ? opts.y : y;
    }

    var textWidth = this.text.DEFAULT_TEXT_WIDTH;
    var textHeight = this.text.DEFAULT_TEXT_HEIGHT;

    opts = merge(opts, {
      superview: this.textContainer,
      text: text,
      x: (this.textContainer.style.width - textWidth) / 2,
      y: (this.textContainer.style.height - textHeight) / 2,
      color: this.text.color,
      fontFamily: this.text.font,
      // FIXME: opts.center, because width and height might be different
      anchorX: textWidth / 2,
      anchorY: textHeight / 2,
      width: textWidth,
      height: textHeight
    });

    var result = new SceneText(opts);
    this.extraViews.push(result);
    return result;
  },

  /**
   * Remove a text view from the scene.
   * @param {SceneText} sceneText The instance to be removed
   */
  removeText: function (sceneText) {
    var extraViews = this.extraViews;
    var index = extraViews.indexOf(sceneText);
    if (index !== -1) {
      sceneText.removeFromSuperview();
      var lastView = extraViews.pop();
      if (index < extraViews.length) {
        extraViews[index] = lastView;
      }
    }
  },

  /**
   * Set the default text color to be applied to any new text view created using {@link scene.addText}
   * @param {string} color
   */
  setTextColor: function (color) {
    // TODO validate?
    this.text.color = color;
  },

  /**
   * Set the default text font to be applied to any new text view created using {@link scene.addText}
   * @param {string} font
   */
  setTextFont: function (font) {
    // TODO validate?
    this.text.font = font;
  },

  /**
   * Set the x and y coordinates in screen space for the score text. The score text remains invisible
   * until this function is called.
   * @method  scene.showScore
   * @param   {number} x
   * @param   {number} y
   * @param   {object} [opts] contains options to be applied to the underlying {@link View}
   * @param   {string} [opts.color]
   * @param   {string} [opts.font]
   * @returns {TextView}
   */
  /**
   * If a resource is specified, a {@link ScoreView} will be used (because they look great).
   * @method scene.showScore(2)
   * @param   {string|object} resource - resource key to be resolved by community art, or opts
   * @param   {number}        x
   * @param   {number}        y
   * @param   {object}        [opts]
   * @returns {SceneScoreView}
   */
  showScore: function (resource, x, y, opts) {
    var scoreView;

    // function type (1)
    if (typeof resource === 'number') {
      opts = y;
      y = x;
      x = resource;

      // Update the old view
      if (this._scoreView) {
        this._scoreView.style.x = x;
        this._scoreView.style.y = y;
        opts && this._scoreView.updateOpts(opts);
        return this._scoreView;
      }

      // Make a new TextView
      opts = opts || {};
      opts.font = opts.font || this.text.font;
      opts.color = opts.color || this.text.color;
      opts.superview = opts.superview || this.textContainer;

      scoreView = new TextView(combine({
        x: x,
        y: y,
        width: 200,
        height: 75,
        fontFamily: opts.font,
        text: this.getScore(),
        horizontalAlign: 'left',
      }, opts));
    }
    // function type (2)
    else {
      // Make a new ScoreView
      var resourceOpts = communityart.getConfig(resource, 'ScoreView');
      opts = opts || {};

      opts.superview = opts.superview || this.textContainer;
      opts.x = x;
      opts.y = y;
      opts.format = opts.format || SceneScoreView.FORMAT_SCORE;

      var viewOpts = merge(opts, resourceOpts);
      scoreView = new SceneScoreView(viewOpts);
    }

    this.extraViews.push(scoreView);
    this._scoreView = scoreView;
    return scoreView;
  },

  /**
   * Easy access to {@link ScaleManager.SCALE_MODE}
   * @type object
   */
  SCALE_MODE: ScaleManager.SCALE_MODE,

  /**
   * The scene scale manager is responsible for automatically fitting your game to any resolution in a reasonable way.
   * The default width and height are 576 and 1024 respectively.
   * The defualt scale mode is {@link ScaleManager.SCALE_MODE.LOCK_HEIGHT}
   * @type ScaleManager
   */
  scaleManager: new ScaleManager(DEFAULT_SCREEN_WIDTH, DEFAULT_SCREEN_HEIGHT),

  /**
   * Update the scaleManager as well as the scene screen dimensions.
   * @param  {number} width
   * @param  {number} height
   * @param  {string} scaleMode A valid {@link ScaleManager.SCALE_MODE} scale mode
   * @see ScaleManager#resize
   * @see scene.updateScreenDimensions
   */
  setScaleOptions: function (width, height, scaleMode) {
    this.scaleManager.resize(width, height, scaleMode);
    this.updateScreenDimensions();
  },

  /**
   * Updates the internal scene variables relying on the scaleManager sizes
   */
  updateScreenDimensions: function () {
    var scaleManager = this.scaleManager;

    this.internal.fire('updateScreenDimensions');
    this.screen.width = scaleManager.width;
    this.screen.height = scaleManager.height;

    if (!this.view) { return; }

    scaleManager.scaleView(this.view);

    var vs = this.view.style;
    vs.x = (scene.app.style.width - vs.width) / 2;
    vs.y = (scene.app.style.height - vs.height) / 2;
    vs.anchorX = vs.width / 2;
    vs.anchorY = vs.height / 2;

    if (this.background) {
      var bs = this.background.style;
      var ts = this.textContainer.style;
      ts.width = bs.width = vs.width;
      ts.height = bs.height = vs.height;
    }
  },

  /**
   * The screen object is the rectangle where all UI lives.  Its dimensions match that of the device screen.
   * Default size is 576 x 1024
   * @type Screen
   */
  screen: new Screen(DEFAULT_SCREEN_WIDTH, DEFAULT_SCREEN_HEIGHT),

  /**
   * The devkit {@link View} which contains the entire scene.
   * @type View
   */
  view: null,

  /**
   * The devkit {@link View} which all backgrounds should be added to.
   * @type Background
   */
  background: null,

  /**
   * The devkit {@link View} which all actors should be added to.
   * @type View
   */
  stage: null,

  /**
   * @type function
   * @see BaseView#addImage
   */
  addImage: null,

  /**
   * The devkit {@link View} which all UI should be added to.
   * @type UIView
   */
  ui: null,

  /**
   * The devkit {@link View} which all text should be added to.
   * @type View
   */
  textContainer: null,

  /**
   * An empty devkit {@link View} which is overtop of the entire game, used to catch input.
   * @type View
   */
  inputOverlay: null,

  __listeners__: [
    {
      event: 'initView',
      cb: function () {
        this.view = new View({
          parent: scene.app,
          width: scene.app.style.width,
          height: scene.app.style.height,
          infinite: true
        });
      }
    },
    {
      event: 'initUI',
      cb: function (app) {

        this.updateScreenDimensions();

        this.background = new Background({
          parent: this.view,
          width: this.screen.width,
          height: this.screen.height
        });

        this.stage = new BaseView({
          parent: this.view,
          infinite: true
        });

        this.addImage = bind(this.stage, this.stage.addImage);

        this.textContainer = new View({
          parent: this.view,
          width:  this.screen.width,
          height: this.screen.height,
          blockEvents: true,
          canHandleEvents: false,
          zIndex: 100000
        });

        this.inputOverlay = new View({ parent: this.view, infinite: true, zIndex: 999999 });
        var touchManager = this.screen.touchManager;
        // forward input events
        this.inputOverlay.onInputStart = bind(touchManager, touchManager.downHandler);
        this.inputOverlay.onInputSelect = bind(touchManager, touchManager.upHandler);
        this.inputOverlay.onInputMove = bind(touchManager, touchManager.moveHandler);

        this.ui = new UIView({
          parent: this.inputOverlay,
          infinite: true
        });
      }
    },
    // Restart
    {
      event: 'restartUI',
      cb: function (mode) {
        this.ui.reset();

        // TODO: Why is there an updatescreendimensions called at reset and init?
        this.updateScreenDimensions();
        this.screen.reset();

        for (var k in this.extraViews) {
          this.extraViews[k].removeFromSuperview();
        }

        this.extraViews = [];

        delete this._scoreView;
        this.background.reset();

        this.stage.removeAllSubviews();
      }
    },
    {
      event: 'restartGame',
      cb: function () {
        this.background.reloadConfig();
      }
    },
    // Tick
    {
      event: 'tickSec',
      cb: function (dt) {
        this.background.update(dt);
      }
    }
  ]
};
