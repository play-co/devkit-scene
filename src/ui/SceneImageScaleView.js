import ui.ImageScaleView as ImageScaleView;
import .PropertyUtil;

exports = Class(ImageScaleView, function() {

  PropertyUtil.addViewProperties(this);

  this.destroy = function() {
    this.removeFromSuperview();
  };

});