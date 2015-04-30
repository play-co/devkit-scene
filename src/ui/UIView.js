import ui.View as View;
import .SceneImageView;
import .SceneImageScaleView;
import .SceneScoreView;
import .ProgressBar;

exports = Class(View, function(supr) {

  this.addImage = function(resource, x, y) {
    var viewOpts = typeof resource === 'object' ? resource : { image: resource };
    var viewClass = (viewOpts.scaleMethod === undefined) ? SceneImageView : SceneImageScaleView;
    viewOpts.x = x;
    viewOpts.y = y;
    viewOpts.superview = this;
    return new viewClass(viewOpts);
  };

  this.addProgressBar = function(resource, x, y) {
    var opts = merge({ superview: this, x: x, y: y }, resource);
    return new ProgressBar(opts);
  };

  this.addScoreText = function(resource, x, y, width, height) {
    var opts = merge({ superview: this, x: x, y: y, width: width, height: height, format: SceneScoreView.FORMAT_SCORE }, resource);
    return new SceneScoreView(opts);
  };

  this.addTimeText = function(resource, x, y, width, height) {
    var opts = merge({ superview: this, x: x, y: y, width: width, height: height, format: SceneScoreView.FORMAT_TIME }, resource);
    return new SceneScoreView(opts);
  };

  this.reset = function() {
    this.removeAllSubviews();
  };

});