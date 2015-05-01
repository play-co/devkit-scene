import ui.View as View;
import ui.ImageView as ImageView;

import .SceneImageView;

exports = Class(SceneImageView, function(supr) {

  this.init = function(opts) {
    opts.autoSize = true;
    opts.image = opts.backgrounds[0];
    supr(this, "init", [opts]);

    this._backgrounds = opts.backgrounds;
    this._fills = opts.fills;

    this._backgroundIndex = -1;
    this._fillIndex = -1;

    this.clipContainer = new View({
      superview: this,
      width: this.style.width,
      height: this.style.height,
      clip: true
    });

    this.fillImage = new ImageView({
      superview: this.clipContainer,
      autoSize: true,
      image: opts.fillImage
    });

    this._value = 0;
    this._setFillValue(0);

    this.animObject = {};
  };

  this.getValue = function() { return this._value; }

  this.setValue = function(value, animationDuration) {
    if (this._value === value) { return; }
    animationDuration = animationDuration || 0;
    var startValue = this._value;
    var target = this;
    scene.animate(this.animObject).now({}, animationDuration, scene.transitions.linear, function(tt, t) {
      target._setFillValue(startValue * (1-tt) + value * tt);
    });
    this._value = value;
  };

  this._setFillValue = function(value) {
    // Subtract the tiniest amount so we can have 100% filled bars on whole numbers
    value -= 0.0001;

    if (value < 0) { value = 0; }
    this.clipContainer.style.width = this.style.width * (value % 1);

    value = Math.floor(value);

    var backgroundIndex = Math.min(value, this._backgrounds.length - 1);
    if (this._backgroundIndex !== backgroundIndex) {
      this._backgroundIndex = backgroundIndex;
      this.setImage(this._backgrounds[backgroundIndex]);
    }

    var fillIndex = Math.min(value, this._fills.length - 1);
    if (this._fillIndex !== fillIndex) {
      this._fillIndex = fillIndex;
      this.fillImage.setImage(this._fills[fillIndex]);
    }
  };

});