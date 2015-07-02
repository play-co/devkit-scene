import scene.ui.BaseView as BaseView;

import .SceneScoreView;
import .ProgressBar;

exports = Class(BaseView, function(supr) {

  this.addProgressBar = function(resource, x, y) {
    var opts = { superview: this };
    x !== undefined && (opts.x = x);
    y !== undefined && (opts.y = y);
    return new ProgressBar(merge(opts, resource));
  };

  this.addScoreText = function(resource, x, y, width, height) {
    var opts = { superview: this, format: SceneScoreView.FORMAT_SCORE };
    x !== undefined && (opts.x = x);
    y !== undefined && (opts.y = y);
    width !== undefined && (opts.width = width);
    height !== undefined && (opts.height = height);
    return new SceneScoreView(merge(opts, resource));
  };

  this.addTimeText = function(resource, x, y, width, height) {
    var opts = { superview: this, format: SceneScoreView.FORMAT_TIME }
    x !== undefined && (opts.x = x);
    y !== undefined && (opts.y = y);
    width !== undefined && (opts.width = width);
    height !== undefined && (opts.height = height);
    return new SceneScoreView(merge(opts, resource));
  };

  this.reset = function() {
    this.removeAllSubviews();
  };

});