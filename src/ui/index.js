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

exports = {
  text: {
    /** @type {Number} scene.text.DEFAULT_TEXT_WIDTH
     * @private
     * @default 350 */
    DEFAULT_TEXT_WIDTH: 350,
    /** @type {Number} scene.text.DEFAULT_TEXT_HEIGHT
     * @private
     * @default 75 */
    DEFAULT_TEXT_HEIGHT: 75,

    /** @type {String} scene.text.color
     * @private
     * @default '#FFF'
     * @see scene.setTextColor
     */
    color: '#FFF',

    /** @type {String} scene.text.font
     * @private
     * @default 'Arial'
     * @see scene.setTextFont
     */
    font: 'Arial'
  },

  /**
   * Construct a splash screen to show at the beginning of the game, click once anywhere to hide the screen.
   * @func scene.splash
   * @arg {function} func
   */
  splash: function(fun, opts) {
    // TODO: Check for an existing splash screen?
    // TODO: How does it know that clicking once goes to the game? Should be more configurable here and not hardcoded
    scene.mode('splash', fun, opts);
  },

  /**
   * Add a background layer to your game.
   * @method scene.addBackground
   * @param  {Object} resource
   * @param  {Object} [opts]
   */
  addBackground: function(art, opts) {
    return scene.background.addLayer(art, opts);
  },

  /**
   * Displays text
   * @func scene.addText
   * @arg {string} text
   * @arg {Object} [opts] - contains options to be applied to {@link TextView}
   * @returns {TextView}
   */
  /**
   * @func scene.addText(2)
   * @arg {string} text
   * @arg {number} x
   * @arg {number} y
   * @arg {Object} [opts] - contains options to be applied to {@link SceneText}
   * @returns {SceneText}
   */
  addText: function(text, x, y, opts) {
    opts = opts || {};

    if (typeof x === 'object') {
      // Function type 1
      opts = x;
    } else if (typeof x === 'number' && typeof y === 'number') {
      // Function type 2
      opts.x = opts.x !== undefined ? opts.x : x;
      opts.y = opts.y !== undefined ? opts.y : y;
    }

    var textWidth = scene.text.DEFAULT_TEXT_WIDTH;
    var textHeight = scene.text.DEFAULT_TEXT_HEIGHT;

    opts = merge(opts, {
      superview: scene.textContainer,
      text: text,
      x: (scene.textContainer.style.width - textWidth) / 2,
      y: (scene.textContainer.style.height - textHeight) / 2,
      color: scene.text.color,
      fontFamily: scene.text.font,
      // FIXME: opts.center, because width and height might be different
      anchorX: textWidth / 2,
      anchorY: textHeight / 2,
      width: textWidth,
      height: textHeight
    });

    var result = new SceneText(opts);
    scene.extraViews.push(result);
    return result;
  },

  /**
   * Remove a text view from the scene.
   * @method scene.removeText
   * @param  {SceneText} sceneText - The instance to be removed
   */
  removeText: function(sceneText) {
    var extraViews = scene.extraViews;
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
   * @method scene.setTextColor
   * @param  {String} color
   */
  setTextColor: function(color) {
    // TODO validate?
    scene.text.color = color;
  },

  /**
   * Set the default text font to be applied to any new text view created using {@link scene.addText}
   * @method scene.setTextFont
   * @param  {String} font
   */
  setTextFont: function(font) {
    // TODO validate?
    scene.text.font = font;
  },

  /**
   * Set the x and y coordinates in screen space for the score text. The score text remains invisible
   * until this function is called.
   * @method  scene.showScore
   * @param   {Number} x
   * @param   {Number} y
   * @param   {Object} [opts] contains options to be applied to the underlying {@link View}
   * @param   {String} [opts.color]
   * @param   {String} [opts.font]
   * @returns {TextView}
   */
  /**
   * If a resource is specified, a {@link ScoreView} will be used (because they look great).
   * @method scene.showScore(2)
   * @param   {String|Object} resource - resource key to be resolved by community art, or opts
   * @param   {Number}        x
   * @param   {Number}        y
   * @param   {Object}        [opts]
   * @returns {SceneScoreView}
   */
  showScore: function(resource, x, y, opts) {
    var scoreView;

    // function type (1)
    if (typeof resource === 'number') {
      opts = y;
      y = x;
      x = resource;

      // Update the old view
      if (scene._scoreView) {
        scene._scoreView.style.x = x;
        scene._scoreView.style.y = y;
        opts && scene._scoreView.updateOpts(opts);
        return scene._scoreView;
      }

      // Make a new TextView
      opts = opts || {};
      opts.font = opts.font || scene.text.font;
      opts.color = opts.color || scene.text.color;
      opts.superview = opts.superview || scene.textContainer;

      scoreView = new TextView(combine({
        x: x,
        y: y,
        width: 200,
        height: 75,
        fontFamily: opts.font,
        text: scene.getScore(),
        horizontalAlign: 'left',
      }, opts));
    }
    // function type (2)
    else {
      // Make a new ScoreView
      var resourceOpts = communityart.getConfig(resource, 'ScoreView');
      opts = opts || {};

      opts.superview = opts.superview || scene.textContainer;
      opts.x = x;
      opts.y = y;
      opts.format = opts.format || SceneScoreView.FORMAT_SCORE;

      var viewOpts = merge(opts, resourceOpts);
      scoreView = new SceneScoreView(viewOpts);
    }

    scene.extraViews.push(scoreView);
    scene._scoreView = scoreView;
    return scoreView;
  },

  /**
   * Easy access to {@link ScaleManager.SCALE_MODE}
   * @var {Object} scene.SCALE_MODE
   */
  SCALE_MODE: ScaleManager.SCALE_MODE,

  /**
   * The scene scale manager is responsible for automatically fitting your game to any resolution in a reasonable way.
   * The default width and height are 576 and 1024 respectively.
   * The defualt scale mode is {@link ScaleManager.SCALE_MODE.LOCK_HEIGHT}
   * @type {ScaleManager} scene.scaleManager
   */
  scaleManager: new ScaleManager(576, 1024, ScaleManager.SCALE_MODE.LOCK_HEIGHT),

  /**
   * Update the scaleManager as well as the scene screen dimensions.
   * @method scene.setScaleOptions
   * @param  {Number} width
   * @param  {Number} height
   * @param  {String} scaleMode
   * @see ScaleManager#resize
   * @see scene.updateScreenDimensions
   */
  setScaleOptions: function(width, height, scaleMode) {
    this.scaleManager.resize(width, height, scaleMode);
    this.updateScreenDimensions();
  },

  /**
   * This automatically updates the internal scene variables relying on the scaleManager sizes
   * @method scene.updateScreenDimensions
   */
  updateScreenDimensions: function() {
    var scaleManager = this.scaleManager;

    scene.internal.fire('updateScreenDimensions');
    this.screen.width = scaleManager.width;
    this.screen.height = scaleManager.height;

    if (!this.view) { return; }

    scaleManager.scaleView(this.view);

    var vs = this.view.style;
    vs.x = (device.width - vs.width) / 2;
    vs.y = (device.height - vs.height) / 2;
    vs.anchorX = vs.width / 2;
    vs.anchorY = vs.height / 2;
  },

  /**
   * The screen object is the rectangle where all UI lives.  Its dimensions match that of the device screen.
   * Default size is 576 x 1024
   * @var {Screen} scene.screen
   */
  screen: new Screen(576, 1024),

  /**
    * The devkit {@link View} which contains the entire scene.
    * @var {View} scene.view
    */
  view: null,

  /**
  * The devkit {@link View} which all backgrounds should be added to.
  * @var {Background} scene.background
  */
  background: null,

  /**
    * The devkit {@link View} which all actors should be added to.
    * @var {View} scene.stage
    */
  stage: null,

  /**
    * @method scene.addImage
    * @see BaseView#addImage
    */
  addImage: null,

  /**
   * The devkit {@link View} which all UI should be added to.
   * @var {UIView} scene.ui
   */
  ui: null,

  /**
   * The devkit {@link View} which all text should be added to.
   * @var {View} scene.textContainer
   */
  textContainer: null,

  /**
   * An empty devkit {@link View} which is overtop of the entire game, used to catch input.
   * @var {View} scene.inputOverlay
   */
  inputOverlay: null,

  __listeners__: {
    init: [
      {
        priority: -1000,
        cb: function (app) {
          this.view = app;
        }
      },
      {
        priority: -10,
        cb: function (app) {
          this.updateScreenDimensions();
        }
      },
      {
        priority: 10,
        cb: function (app) {
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

          this.ui = new UIView({
            superview: this.view,
            infinite: true
          });

          this.textContainer = new View({
            parent: this.view,
            width:  this.screen.width,
            height: this.screen.height,
            blockEvents: true,
            zIndex: 100000
          });
        }
      },
      {
        priority: 1000,
        cb: function (app) {
          this.inputOverlay = new View({ parent: this.view, infinite: true, zIndex: 999999 });
          var touchManager = this.screen.touchManager;
          this.inputOverlay.onInputStart = bind(touchManager, touchManager.downHandler);
          this.inputOverlay.onInputSelect = bind(touchManager, touchManager.upHandler);
          this.inputOverlay.onInputMove = bind(touchManager, touchManager.moveHandler);
        }
      }
    ]
  }
};
