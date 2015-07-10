import ui.ImageScaleView as ImageScaleView;
import .PropertyUtil;

/**
 * Note: Instances will have all the exposed default style properties from {@link PropertyUtil}
 * @class SceneImageScaleView
 * @extends ImageScaleView
 */
exports = Class(ImageScaleView, function() {

  PropertyUtil.addViewProperties(this);

  /**
   * Remove this image from its superview
   * @method  SceneImageScaleView#destroy
   */
  this.destroy = function() {
    this.removeFromSuperview();
  };

});
