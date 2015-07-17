import ui.View as View;
import ui.ImageView as ImageView;

import communityart;

import parallax.Parallax as Parallax;

import scene.utils.performance as performance;
import .BackgroundLayer;

/** @lends Background */
exports = Class(View, function (supr) {

  /**
   * The generic background class for a scene game.
   * @constructs
   * @arg {object} [opts]
   * @extends View
   */
  this.init = function(opts) {
    supr(this, 'init', arguments);

    /** @type Parallax */
    this.parallax = new Parallax({
      parent: this
    });

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
  this.reloadConfig = function(config) {
    this.config = config || this.config;
    this.parallax.reset(this.config);
  };

  /**
   * Reset this and the parallax instance to their fresh states.
   */
  this.reset = function() {
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
  this.update = function(dt) {
    this.scroll(dt * this.autoX, dt * this.autoY);
  };

  /**
   * Add an amount to the current offsets
   * @param  {number} x
   * @param  {number} y
   */
  this.scroll = function(x, y) {
    this._offsetX += x;
    this._offsetY += y;
    this._updateParallax();
  };

  /**
   * Updates the parallax instance
   */
  this._updateParallax = function() {
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
  this.autoScroll = function(autoX, autoY) {
    if (autoY === undefined) {
      autoY = autoX;
    }
    this.autoX = autoX;
    this.autoY = autoY;
  };

  /**
   * Used set the offsets to an exact number.  In most cases you should use {@link Background#autoScroll}
   * @param  {number} x
   * @param  {number} y
   */
  this.scrollTo = function(x, y) {
    if (this._offsetX === x && this._offsetY === y) { return; }
    this._offsetX = x;
    this._offsetY = y;
    this._updateParallax();
  };

  /**
   * @arg {object} resource Can be a parallax config, an array of parallax layer configs, or a static background (no opts specified)
   * @arg {Object} [opts] Contains options to be applied to the underlying {@link Layer}. If not specified, a static {@link View} is displayed.
   * @arg {number} [opts.scrollX] Marks the parallax layer to sroll in the X direction at the specified speed
   * @arg {number} [opts.scrollY] Marks the parallax layer to sroll in the Y direction at the specified speed
   * @arg {number} [opts.repeatX]
   * @arg {number} [opts.repeatY]
   * @arg {number} [opts.x] Forwarded to the parallax config pieceOptions
   * @arg {number} [opts.y] Forwarded to the parallax config pieceOptions
   * @arg {number} [opts.align] Either `left`, `right`, `top`, or `bottom`
   * @returns {BackgroundLayer|View}
   */
  this.addLayer = function(resource, opts) {
    performance.start('Background:addLayer');
    if (Array.isArray(resource)) {
      resource = {
        type: 'ParallaxConfig',
        config: resource
      };
    }

    if (resource.type === 'ParallaxConfig') {
      for (var l in resource.config) {
        var layerConfig = resource.config[l];
        var layer = new BackgroundLayer(layerConfig, this);
        this.config.push(layerConfig);
        layer.setScroll(layerConfig.xMultiplier, layerConfig.yMultiplier);
      }
    } else if (!opts) {
      // Static image - auto-fits width, centered, maintains aspect ratio
      // TODO: handle edge cases ... LOCK_WIDTH vs HEIGHT, no resource.width / height provided, etc.
      var w = this.style.width;
      var h = resource.height * this.style.width / resource.width;
      return new ImageView({
        superview: this,
        x: (this.style.width - w) / 2,
        y: (this.style.height - h) / 2,
        width: w,
        height: h,
        image: resource.url || resource.image
      });
    } else {
      // Automatic repeating
      if (!opts.repeatX && opts.scrollX) { opts.repeatX = true; }
      if (!opts.repeatY && opts.scrollY) { opts.repeatY = true; }
      // Automatic alignment
      if (opts.align === 'bottom' && opts.y === undefined) { opts.y = this.style.height; }
      else if (opts.align === 'top' && opts.y === undefined) { opts.y = 0; }
      else if (opts.align === 'left' && opts.x === undefined) { opts.x = this.style.width; }
      else if (opts.align === 'right' && opts.x === undefined) { opts.x = 0; }

      // Build pieceOptions
      var pieceOptions = { image: resource.url || resource.image };
      if (opts.align === 'left' || opts.align === 'right') {
        pieceOptions.xAlign = opts.align;
      } else if (opts.align === 'top' || opts.align === 'bottom') {
        pieceOptions.yAlign = opts.align;
      }
      if (opts.x !== undefined) { pieceOptions.x = opts.x; }
      if (opts.y !== undefined) { pieceOptions.y = opts.y; }

      var config_opts = {
        zIndex: this.zIndex,
        xCanSpawn: opts.repeatX || false,
        xCanRelease: opts.repeatX || false,
        yCanSpawn: opts.repeatY || false,
        yCanRelease: opts.repeatY || false,
        pieceOptions: [pieceOptions]
      };

      this.config.push(config_opts);
      var layer = new BackgroundLayer(config_opts, this);
      layer.setScroll(opts.scrollX, opts.scrollY);
    }

    this.zIndex = Math.max(this.zIndex - 1, 0);
    performance.stop('Background:addLayer');
    return layer;
  }

});
