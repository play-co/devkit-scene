import ui.View as View;
import ui.ImageView as ImageView;

import .SceneImageView;

/** @lends ProgressBar */
exports = Class(SceneImageView, function(supr) {

  /**
   * @constructs
   * @param  {object} opts
   * @param  {View[]} [opts.backgrounds] Used for multi-fill progress bars
   * @param  {View}   [opts.image]       Either this or opts.backgrounds must be defined.
   * @param  {View[]} [opts.fills]       The images to use for filling the progress bar
   * @param  {View}   [opts.fillImage]   The defualt fill image (when not multi-filling)
   */
  this.init = function(opts) {
    opts.autoSize = true;
    opts.image = opts.backgrounds ? opts.backgrounds[0] : opts.image;
    supr(this, "init", [opts]);

    this._backgrounds = opts.backgrounds || null;
    this._fills = opts.fills || null;

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

  /**
   * The amount of fill the bar currently is representing.
   * @returns {number}
   */
  this.getValue = function() { return this._value; }

  /**
   * @param  {number} value             Value between 0 and 1. The value can be greater than 1 when using multi-fill
   * @param  {number} animationDuration In milliseconds
   */
  this.setValue = function(value, animationDuration) {
    if (this._value === value) { return; }
    var startValue = this._value;
    var target = this;
    if (animationDuration) {
      scene.animate(this.animObject).now({}, animationDuration, scene.transitions.linear, function(tt, t) {
        target._setFillValue(startValue * (1-tt) + value * tt);
      });
    } else {
      target._setFillValue(value);
    }
    this._value = value;
  };

  /**
   * Actually runs the calculations for multi-fill and clipping.
   * @private
   * @param  {number} value
   */
  this._setFillValue = function(value) {
    // Subtract the tiniest amount so we can have 100% filled bars on whole numbers
    value -= 0.0001;

    if (value < 0) { value = 0; }
    this.clipContainer.style.width = this.style.width * (value % 1);

    value = Math.floor(value);

    if (this._backgrounds) {
      var backgroundIndex = Math.min(value, this._backgrounds.length - 1);
      if (this._backgroundIndex !== backgroundIndex) {
        this._backgroundIndex = backgroundIndex;
        this.setImage(this._backgrounds[backgroundIndex]);
      }
    }

    if (this._fills) {
      var fillIndex = Math.min(value, this._fills.length - 1);
      if (this._fillIndex !== fillIndex) {
        this._fillIndex = fillIndex;
        this.fillImage.setImage(this._fills[fillIndex]);
      }
    }
  };

});