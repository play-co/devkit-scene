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
    this.background.reset();
  }
});

exports = Class(function () {
  this.init = function(parentView) {
    this.parallax = new Parallax({ parent: parentView });
    this.offsetX = 0;
    this.offsetY = 0;
    this.autoX = 0;
    this.autoY = 0;
    this.destroy();
  }

  this.destroy = function() {
    this.zIndex = -1;
    this.config = [];
  }

  this.reset = function() {
    this.parallax.reset(this.config);
  }

  this.update = function(dt) {
    this.scroll(dt * this.autoX, dt * this.autoY);
  }

  this.scroll = function(x, y) {
    this.offsetX += x;
    this.offsetY += y;
    this.parallax.update(this.offsetX, this.offsetY);
  }

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
  }

  /**
   * scrollTo(x, y)
   */
  this.scrollTo = function(x, y) {
    this.offsetX = x;
    this.offsetY = y;
    this.parallax.update(this.offsetX, this.offsetY);
  };

  /**
   * addLayer(resource, imageViewOpts)
   */
  this.addLayer = function(resource, opts) {
    // if (resource.type !== 'image') {
    //   throw 'Background layers must be images, but you gave me a ' + resource.type + '!';
    // }

    opts = opts || {};
    var imageUrl = (typeof resource === "string") ? resource : resource.url;

    var pieceOptions = { image:imageUrl };
    if (opts.xAlign !== undefined) { pieceOptions.xAlign = opts.xAlign; }
    if (opts.yAlign !== undefined) { pieceOptions.yAlign = opts.yAlign; }
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

    this.zIndex -= 1;
    this.config.push(config_opts);
    return new Layer(config_opts, this)._setScroll(opts.scrollX, opts.scrollY);
  }
});
