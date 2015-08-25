import ui.View as View;
import scene.ui.SceneImageView as SceneImageView;
import scene.ui.SceneImageScaleView as SceneImageScaleView;

/**
 * @class BaseView
 * @extends View
 */
exports = Class(View, function () {
  /**
   * @method BaseView#addImage
   * @param {object} opts - options that define the image
   * @param {number} [opts.image|opts.url] - path to the image asset
   * @param {number} [opts.superview] - the parent view in the view hierarchy
   * @param {boolean} [opts.autoSize] - determine view dimensions based on the image asset
   * @return {SceneImageView|SceneImageScaleView} 
   */
  this.addImage = function (opts) {
    opts.image = opts.image || opts.url;
    opts.superview = opts.superview || this;
    opts.autoSize = opts.autoSize !== void 0 ? opts.autoSize : (opts.width === void 0 && opts.height === void 0);
    var viewClass = (opts.scaleMethod === void 0) ? SceneImageView : SceneImageScaleView;
    return new viewClass(opts);
  };
});
