import ui.View as View;

import scene.ui.SceneImageView as SceneImageView;
import scene.ui.SceneImageScaleView as SceneImageScaleView;

/**
 * @class BaseView
 * @extends View
 */
exports = Class(View, function(supr) {
  /**
   * @method BaseView#addImage
   * @param  {String|Object} resource - resource object, or opts
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Object} [opts]
   * @return {View} imageView
   */
  /**
   * @method BaseView#addImage(1)
   * @param  {String|Object} resource
   * @param  {Number} x
   * @param  {Number} y
   * @param  {Number} width
   * @param  {Number} height
   * @param  {Object} [opts]
   * @return {View} imageView
   */
  this.addImage = function(resource, x, y, width, height, opts) {
    // Check for signature (1)
    if (typeof width === 'object') {
      opts = width;
    } else {
      opts = opts || {};
      opts.width = width || opts.width;
      opts.height = height || opts.height;
    }

    opts = merge(opts, resource);
    if (!opts.image && opts.url) {
      opts.image = opts.url;
    }

    opts.superview = opts.superview || this;
    opts.autoSize = opts.autoSize !== undefined
        ? opts.autoSize
        : (opts.width === undefined && opts.height === undefined);
    opts.x = x !== undefined ? x : opts.x || 0;
    opts.y = y !== undefined ? y : opts.y || 0;

    // Set up the view
    var viewClass = (opts.scaleMethod === undefined) ? SceneImageView : SceneImageScaleView;
    var result = new viewClass(opts);

    return result;
  };
});
