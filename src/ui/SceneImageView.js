import ui.ImageView as ImageView;
import .PropertyUtil;

/**
 * Note: Instances will have all the exposed default style properties from {@link PropertyUtil}
 * @class SceneImageView
 * @extends ImageView
 */
exports = Class(ImageView, function() {

  PropertyUtil.addViewProperties(this);

  /**
   * Remove this image from its superview
   * @method  SceneImageView#destroy
   */
  this.destroy = function() {
    this.removeFromSuperview();
  };

});