import ui.View as View;
import ui.ImageView as ImageView;
import ui.resource.Image as Image;
import parallax.Parallax as Parallax;
import scene.utils.performance as performance;
import .BackgroundLayer;

/** @lends Background */
exports = Class(View, function () {
  var suprPrototype = View.prototype;

  /**
   * The generic background class for a scene game.
   * @constructs
   * @arg {object} [opts]
   * @extends View
   */
  this.init = function (opts) {
    suprPrototype.init.call(this, opts);

    /** @type Parallax */
    this.parallax = new Parallax({ parent: this });

    /**
     * The current total offset of the background (individual layers may vary based on their scroll rate)
     * @type number
     */
    this._offsetX = 0;
    /**
     * The current total offset of the background (individual layers may vary based on their scroll rate)
     * @type number
     */
    this._offsetY = 0;

    /**
     * The rate at which the background should scroll automatically.
     * @type number
     * @default 0
     */
    this.autoX = 0;
    /**
     * The rate at which the background should scroll automatically.
     * @type number
     * @default 0
     */
    this.autoY = 0;

    /** @type number */
    this.zIndex = 0;
    /**
     * A dynamically built parallax config.
     * @type array
     */
    this.config = null;

    this.reset();
  };

  /**
   * Reload the underlying parallax instance using either a new or the existing config.
   * @param  {array} config A valid parallax config
   */
  this.reloadConfig = function (config) {
    this.config = config || this.config;
    this.parallax.reset(this.config);
  };

  /**
   * Reset this and the parallax instance to their fresh states.
   */
  this.reset = function () {
    this._offsetX = 0;
    this._offsetY = 0;
    this.autoX = 0;
    this.autoY = 0;
    this.zIndex = -1;
    this.config = [];

    this.reloadConfig();
    // Clear all subviews, except parallax
    var subviews = this.getSubviews();
    var parallaxViews = this.parallax.layerPool._views;

    for (var i = 0; i < subviews.length; ++i) {
      var subview = subviews[i];
      if (parallaxViews.indexOf(subview) >= 0) continue;
      this.removeSubview(subview);
    }
  };

  /**
   * Used by scene internally
   * @param  {number} dt In seconds
   */
  this.update = function (dt) {
    this.scroll(dt * this.autoX, dt * this.autoY);
  };

  /**
   * Add an amount to the current offsets
   * @param  {number} x
   * @param  {number} y
   */
  this.scroll = function (x, y) {
    this._offsetX += x;
    this._offsetY += y;
    this._updateParallax();
  };

  /**
   * Updates the parallax instance
   */
  this._updateParallax = function () {
    performance.start('Background:updateParallax');
    this.parallax.update(this._offsetX, this._offsetY);
    performance.stop('Background:updateParallax');
  };

  /**
   * Set the rate of the auto scrolling of the background
   * @arg {number} autoX
   * @arg {number} autoY
   *
   * @also
   * @arg {number} amount Used for both x and y
   */
  this.autoScroll = function (autoX, autoY) {
    if (autoY === void 0) {
      autoY = autoX;
    }
    this.autoX = autoX;
    this.autoY = autoY;
  };

  /**
   * Used set the offsets to an exact number. In most cases you should use {@link Background#autoScroll}
   * @param {number} x
   * @param {number} y
   */
  this.scrollTo = function (x, y) {
    if (this._offsetX === x && this._offsetY === y) { return; }
    this._offsetX = x;
    this._offsetY = y;
    this._updateParallax();
  };

  /**
   * Add a static background image
   * @function addLayer
   * @param {object} opts - Options applied to the {@link ImageView}
   * @returns {ImageView}
   */
   /**
    * Add a single parallax layer
    * @function addLayer(2)
    * @param {object} opts - Options applied to the {@link BackgroundLayer}; includes simple aliases for devkit-parallax API
    * @param {number} [opts.scrollX] - Relative speed at which to scroll in the x-direction; alias for devkit-parallax xMultiplier
    * @param {number} [opts.scrollY] - Relative speed at which to scroll in the y-direction; alias for devkit-parallax yMultiplier
    * @param {number} [opts.repeatX] - Whether or not to continue spawning parallax pieces in the x-direction while scrolling; alias for devkit-parallax xCanSpawn and xCanRelease
    * @param {number} [opts.repeatY] - Whether or not to continue spawning parallax pieces in the y-direction while scrolling; alias for devkit-parallax yCanSpawn and yCanRelease
    * @param {number} [opts.align] - Either 'left', 'right', 'top', or 'bottom'
    * @param {number} [opts.x] - x, y, scale, and other {@link View} style properties are forwarded to the parallax piece
    * @returns {BackgroundLayer}
    */
    /**
     * Add a set of parallax layers; see {@link https://github.com/gameclosure/devkit-parallax#parallax-config devkit-parallax} for config API
     * @function addLayer(3)
     * @param {object[]|object} opts - An array of parallax layer config objects or a parallax resource object returned by scene.registerConfig
     * @returns {BackgroundLayer}
     */
  this.addLayer = function (opts) {
    performance.start('Background:addLayer');

    if (Array.isArray(opts)) {
      opts = {
        type: 'ParallaxConfig',
        config: opts
      };
    }

    if (opts.type === 'ParallaxConfig') {
      for (var l in opts.config) {
        var layerConfig = opts.config[l];
        var layer = new BackgroundLayer(layerConfig, this);
        this.config.push(layerConfig);
        layer.setScroll(layerConfig.xMultiplier, layerConfig.yMultiplier);
      }
    } else if (opts.scrollX === void 0 && opts.scrollY === void 0) {
      // Static image - auto-fits, centered, maintains aspect ratio
      var img = new Image({ url: opts.url || opts.image });
      var w, h;
      if (opts.autoSize) {
        var map = img.getMap();
        w = map.width;
        h = map.height;
      } else {
        w = opts.width || this.style.width;
        h = opts.height || this.style.height;
      }
      var scale = 1;
      var scaleMode = scene.scaleManager.scaleMode;
      if (scaleMode === scene.SCALE_MODE.LOCK_WIDTH) {
        scale = this.style.width / w;
      } else if (scaleMode === scene.SCALE_MODE.LOCK_HEIGHT) {
        scale = this.style.height / h;
      }

      return new ImageView({
        superview: this,
        x: (this.style.width - w) / 2,
        y: (this.style.height - h) / 2,
        anchorX: w / 2,
        anchorY: h / 2,
        width: w,
        height: h,
        scale: scale,
        image: img
      });
    } else {
      // Build a single scrolling piece
      var piece = { image: opts.url || opts.image };

      // Automatic repeating
      opts.repeatX === void 0 && opts.scrollX && (opts.repeatX = true);
      opts.repeatY === void 0 && opts.scrollY && (opts.repeatY = true);

      // Automatic alignment
      switch (opts.align) {
        case 'top':
          piece.yAlign = opts.align;
          if (opts.y === void 0) { opts.y = 0; }
          break;
        case 'bottom':
          piece.yAlign = opts.align;
          if (opts.y === void 0) { opts.y = this.style.height; }
          break;
        case 'left':
          piece.xAlign = opts.align;
          if (opts.x === void 0) { opts.x = 0; }
          break;
        case 'right':
          piece.xAlign = opts.align;
          if (opts.x === void 0) { opts.x = this.style.width; }
          break;
      }

      // forward view style properties to the parallax piece
      for (var prop in opts) {
        piece[prop] = opts[prop];
      }

      var configOpts = {
        zIndex: this.zIndex,
        xCanSpawn: opts.repeatX || false,
        xCanRelease: opts.repeatX || false,
        yCanSpawn: opts.repeatY || false,
        yCanRelease: opts.repeatY || false,
        pieceOptions: [piece]
      };

      this.config.push(configOpts);
      var layer = new BackgroundLayer(configOpts, this);
      layer.setScroll(opts.scrollX, opts.scrollY);
    }

    this.zIndex = Math.max(this.zIndex - 1, 0);
    performance.stop('Background:addLayer');
    return layer;
  }

});
