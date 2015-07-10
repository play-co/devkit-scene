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
      opts.width = width || resourceOpts.width;
      opts.height = height || resourceOpts.height;
    }

    var viewOpts = merge(opts, resourceOpts);
    viewOpts.superview = viewOpts.superview || this;
    viewOpts.autoSize = viewOpts.autoSize !== undefined
        ? viewOpts.autoSize
        : (viewOpts.width === undefined && viewOpts.height === undefined);
    viewOpts.x = x !== undefined ? x : viewOpts.x || 0;
    viewOpts.y = y !== undefined ? y : viewOpts.y || 0;

    // Set up the view
    var viewClass = (viewOpts.scaleMethod === undefined) ? SceneImageView : SceneImageScaleView;
    var result = new viewClass(viewOpts);

    return result;
  };
});
