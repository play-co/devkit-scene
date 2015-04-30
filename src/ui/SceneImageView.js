import ui.ImageView as ImageView;
import .PropertyUtil;

exports = Class(ImageView, function() {

  PropertyUtil.addViewProperties(this);

  this.destroy = function() {
    this.removeFromSuperview();
  };

});