import ui.View as View;

import scene.ui.SceneImageView as SceneImageView;
import scene.ui.SceneImageScaleView as SceneImageScaleView;

import communityart;

exports = Class(View, function(supr) {
  /**
    * @method scene.addImage
    * @param  {String|Object} resource - resource key to be resolved by community art, or opts
    * @param  {Number} x
    * @param  {Number} y
    * @param  {Object} [opts]
    * @return {View} imageView
    */
  /**
    * @method scene.addImage(2)
    * @param  {String|Object} resource
    * @param  {Number} x
    * @param  {Number} y
    * @param  {Number} width
    * @param  {Number} height
    * @param  {Object} [opts]
    * @return {View} imageView
    */
  this.addImage = function(resource, x, y, width, height, opts) {
    var resourceOpts = communityart.getConfig(resource, 'ImageView');
    if (!resourceOpts.image && resourceOpts.url) {
      resourceOpts.image = resourceOpts.url;
    }

    // Check for signature (1)
    if (typeof width === 'object') {
      opts = width;
    } else {
      opts = opts || {};
      opts.width = width;
      opts.height = height;
    }

    opts.superview = opts.superview || this;
    opts.autoSize = opts.autoSize !== undefined
        ? opts.autoSize
        : (opts.width === undefined && opts.height === undefined);
    opts.x = x;
    opts.y = y;

    // Set up the view
    var viewOpts = merge(opts, resourceOpts);

    var viewClass = (viewOpts.scaleMethod === undefined) ? SceneImageView : SceneImageScaleView;
    var result = new viewClass(viewOpts);

    return result;
  };
});
