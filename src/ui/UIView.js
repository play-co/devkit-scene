import scene.ui.BaseView as BaseView;

import .SceneScoreView;
import .ProgressBar;

/**
 * @class UIView
 * @extends BaseView
 */
/** @lends UIView */
exports = Class(BaseView, function(supr) {

  /**
   * @method addProgressBar
   * @param  {object}       viewOpts
   * @param  {number}       [x]
   * @param  {number}       [y]
   * @return {ProgressBar}
   */
  this.addProgressBar = function(viewOpts, x, y) {
    var opts = { superview: this };
    x !== undefined && (opts.x = x);
    y !== undefined && (opts.y = y);
    return new ProgressBar(merge(opts, viewOpts));
  };

  /**
   * Add a SceneScoreView with score formatting
   * @param  {object}     viewOpts
   * @param  {number}     [x]
   * @param  {number}     [y]
   * @param  {number}     [width]
   * @param  {number}     [height]
   * @return {SceneScoreView}
   */
  this.addScoreText = function(viewOpts, x, y, width, height) {
    var opts = { superview: this, format: SceneScoreView.FORMAT_SCORE };
    x !== undefined && (opts.x = x);
    y !== undefined && (opts.y = y);
    width !== undefined && (opts.width = width);
    height !== undefined && (opts.height = height);
    return new SceneScoreView(merge(opts, viewOpts));
  };

  /**
   * Add a SceneScoreView with time formatting
   * @param  {object}    viewOpts
   * @param  {number}    [x]
   * @param  {number}    [y]
   * @param  {number}    [width]
   * @param  {number}    [height]
   * @return {SceneScoreView}
   */
  this.addTimeText = function(viewOpts, x, y, width, height) {
    var opts = { superview: this, format: SceneScoreView.FORMAT_TIME }
    x !== undefined && (opts.x = x);
    y !== undefined && (opts.y = y);
    width !== undefined && (opts.width = width);
    height !== undefined && (opts.height = height);
    return new SceneScoreView(merge(opts, viewOpts));
  };

  /** Remove all subviews */
  this.reset = function() {
    this.removeAllSubviews();
  };

});