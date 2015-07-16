/** @lends BackgroundLayer */
exports = Class(function () {

  /**
   * The background generates instances, these are essentially a config container.
   * @constructs
   * @param  {object}     config Parallax config
   * @param  {Background} background Parent instance
   */
  this.init = function(config, background) {
    this.config = config;
    this.background = background;
  }

  /**
   * Sets the parallax config multipliers
   * @param  {number} [sx=1]
   * @param  {number} [sy=1]
   * @returns {BackgroundLayer} thisInstance
   */
  this._setScroll = function(sx, sy) {
    this.config.xMultiplier = sx !== undefined ? sx : 1;
    this.config.yMultiplier = sy !== undefined ? sy : 1;
    // TODO fix it so we can set scrolling mid-game
    //this.config.xOffset = -(sx || 0) * this.background.offsetX;
    //this.config.yOffset = -(sy || 0) * this.background.offsetY;
    return this;
  }

  /**
   * Invokes {@link BackgroundLayer#_setScroll} as well as reloading the parent background config
   * @param  {number}  sx
   * @param  {number}  sy
   */
  this.setScroll = function(sx, sy) {
    this._setScroll(sx, sy);
    this.background.reloadConfig();
  }

});
