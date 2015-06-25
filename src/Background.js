import communityart;
import ui.View as View;
import ui.ImageView as ImageView;

import parallax.Parallax as Parallax;

// The background serves as a generator for this class
// Those instances are exposed to the user
var Layer = Class(function () {
  this.init = function(config, background) {
    this.config = config;
    this.background = background;
  }

  this._setScroll = function(sx, sy) {
    this.config.xMultiplier = sx || 1;
    this.config.yMultiplier = sy || 1;
    // TODO fix it so we can set scrolling mid-game
    //this.config.xOffset = -(sx || 0) * this.background.offsetX;
    //this.config.yOffset = -(sy || 0) * this.background.offsetY;
    return this;
  }

  // This function doesn't fully work right now
  this.setScroll = function(sx, sy) {
    this._setScroll(sx, sy);
    this.background.reloadConfig();
  }
});

exports = Class(View, function (supr) {
  /**
    * The generic background class for a scene game.
    * @class Background
    * @arg {Object} [opts]
    * @extends View
    */
  this.init = function(opts) {
    supr(this, 'init', arguments);

    this.parallax = new Parallax({
      parent: this
    });
    this.offsetX = 0;
    this.offsetY = 0;
    this.autoX = 0;
    this.autoY = 0;
    this.destroy();
  };

  this.destroy = function() {
    this.zIndex = -1;
    this.config = [];
  };

  this.reloadConfig = function(config) {
    this.config = config || this.config;
    this.parallax.reset(this.config);
  };

  this.reset = function() {
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

  this.update = function(dt) {
    this.scroll(dt * this.autoX, dt * this.autoY);
  };

  this.scroll = function(x, y) {
    this.offsetX += x;
    this.offsetY += y;
    this.parallax.update(this.offsetX, this.offsetY);
  };

  /**
   * autoScroll(autoScroll)
   * autoScroll(autoScrollX, autoScrollY)
   *
   * Set the rate of the auto scrolling of the background (by default it is 1, 1).
   * This multiplicativly affects the scrolling of the parallax
   * (false or 0 disables)
   */
  this.autoScroll = function(autoX, autoY) {
    if (autoY === undefined) {
      autoY = autoX;
    }
    this.autoX = autoX;
    this.autoY = autoY;
  };

  /**
   * scrollTo(x, y)
   */
  this.scrollTo = function(x, y) {
    if (this.offsetX === x && this.offsetY === y) { return; }
    this.offsetX = x;
    this.offsetY = y;
    this.parallax.update(this.offsetX, this.offsetY);
  };

  /**
    * @alias scene.addBackground
    * @arg {ArtObject} art
    * @arg {Object} [opts] - Contains options to be applied to the underlying {@link Layer}. If not specified, a static {@link View} is displayed.
    * @arg {number} [opts.scrollX] - Marks the parallax layer to sroll in the X direction, by the specified amount
    * @arg {number} [opts.scrollY] - Marks the parallax layer to sroll in the Y direction, by the specified amount
    * @arg {number} [opts.align] - Either `left`, `right`, `top`, or `bottom`
    * @returns {Layer|View}
    */
  this.addLayer = function(resource, opts) {
    if (Array.isArray(resource)) {
      resource = {
        type: 'ParallaxConfig',
        config: resource
      };
    }

    if (resource.type === 'ParallaxConfig') {
      for (var l in resource.config) {
        var layerConfig = resource.config[l];
        var layer = new Layer(layerConfig, this);
        layer._setScroll(layerConfig.xMultiplier, layerConfig.yMultiplier);
        this.config.push(layerConfig);
      }
    } else if(!opts) {
      // Static image
      var view = new ImageView({
        superview: this,
        image: resource.url,
        x: 0,
        y: 0,
        width: this.style.width,
        height: this.style.height
      });
      return view;
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
      var pieceOptions = { image: resource.url };
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
      var layer = new Layer(config_opts, this);
      layer._setScroll(opts.scrollX, opts.scrollY);
    }

    this.zIndex = Math.max(this.zIndex - 1, 0);
    return layer;
  }
});
