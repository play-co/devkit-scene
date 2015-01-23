import parallax.Parallax as Parallax;

// The background serves as a generator for this class
// Those instances are exposed to the user
var Layer = Class(function () {
  this.init = function(config, background) {
    this.config = config;
    this.background = background;
  }

  this._setScroll = function(sx, sy) {
    if (sy && !sx) {
      this.config.xCanSpawn = false;
      this.config.xCanRelease = false;
    }

    if (sx && !sy) {
      this.config.yCanSpawn = false;
      this.config.yCanRelease = false;
    }

    this.config.xMultiplier = sx || 0;
    this.config.yMultiplier = sy || 0;
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
    this.destroy();
  }

  this.destroy = function() {
    this.config = [];
  }

  this.reset = function() {
    this.parallax.reset(this.config);
  }

  this.update = function(dt) {
    this.offsetX += dt;
    this.offsetY += dt;
    this.parallax.update(this.offsetX, this.offsetY);
  }

  this.scrollTo = function(x, y) {
    this.offsetX = x;
    this.offsetY = y;
  }

  this.addLayer = function(resource, opts0) {
    if (resource.type !== 'image') {
      throw 'Background layers must be images, but you gave me a ' + resource.type + '!';
    }

    opts0 = opts0 || {};
    var opts = {
      zIndex: -1,
      xGapRange: [0, 0],
      yGapRange: [0, 0],
      pieceOptions: [{ image: resource.url }],
    };

    this.config.push(opts);
    return new Layer(opts, this)._setScroll(opts0.scrollX, opts0.scrollY);
  }
});
