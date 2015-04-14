import ui.SpriteView as SpriteView;

exports = Class(SpriteView, function(supr) {

  this.init = function(opts) {
    this.updateHasAnimationFlag(opts);
    if (!this.hasAnimations) {
      opts.image = opts.url;
    }
    supr(this, "init", arguments);
  };

  this.resetAllAnimations = function(opts) {
    this.updateHasAnimationFlag(opts);
    // Only reset animations if we're actually animated
    if (this.hasAnimations) {
      supr(this, "resetAllAnimations", arguments);
      this.setImage(this._animations[opts.defaultAnimation].frames[0]);
    } else {
      this.setImage(opts.url);
    }
  };

  this.startAnimation = function (name, opts) {
    // Only start animation if we're actually animated
    if (this.hasAnimations && this._animations[name]) {
      supr(this, "startAnimation", arguments);
    }
  };

  this.updateHasAnimationFlag = function(opts) {
    // Safeguard flag to allow a SpriteView to act as a normal ImageView
    this.hasAnimations = SpriteView.allAnimations[opts.url] !== undefined;
  };

});