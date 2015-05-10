import ..BaseView;

import .SceneScoreView;
import .ProgressBar;

exports = Class(BaseView, function(supr) {

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