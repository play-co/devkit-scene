import device;

/** @lends ScaleManager */
exports = Class(function() {

  /**
   * @constructs
   * @param  {number} width
   * @param  {number} height
   * @param  {string} [scaleMode=LOCK_HEIGHT] A valid scale mode from {@link ScaleManager.SCALE_MODE}
   */
  this.init = function(width, height, scaleMode) {
    /** @type {number} */
    this.width = null;
    /** @type {number} */
    this.height = null;
    /** @type {string} */
    this.scaleMode = null;

    /** @type {number} */
    this.width = null;

    this.resize(width, height, scaleMode || exports.SCALE_MODE.LOCK_HEIGHT);
  };

  /**
   * Set a new width, height, and scale mode.  Then use those to determine a new scale based on the device size.
   * @param  {number} width
   * @param  {number} height
   * @param  {string} scaleMode A valid scale mode from {@link ScaleManager.SCALE_MODE}
   */
  this.resize = function(width, height, scaleMode) {
    this.width = width;
    this.height = height;
    this.scaleMode = scaleMode;

    var scaleModes = exports.SCALE_MODE;
    switch (scaleMode) {
      case scaleModes.NONE:
        this.scale = 1;
        break;

      case scaleModes.LOCK_WIDTH:
        this.scale = device.width / width;
        this.height = device.height / this.scale;
        break;

      case scaleModes.LOCK_HEIGHT:
        this.scale = device.height / height;
        this.width = device.width / this.scale;
        break;
    }
  };

  /**
   * Apply the scale to a view's style
   * @param  {View}  view
   */
  this.scaleView = function(view) {
    view.style.scale = this.scale;
    view.style.width = this.width;
    view.style.height = this.height;
  };

});

/**
 * @var {object} ScaleManager.SCALE_MODE
 * @property {string} NONE
 * @property {string} LOCK_WIDTH
 * @property {string} LOCK_HEIGHT
 */
exports.SCALE_MODE = {
  NONE:        'scaleModeNone',
  LOCK_WIDTH:  'scaleModeLockWidth',
  LOCK_HEIGHT: 'scaleModeLockHeight'
};
