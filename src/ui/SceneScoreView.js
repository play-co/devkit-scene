import ui.ScoreView as ScoreView;

var SceneScoreView = exports = Class(ScoreView, function(supr) {

  this.init = function(opts) {
    supr(this, "init", arguments);
    this.format = opts.format;
    this.setValue(0);
  };

  this.setValue = function(value) {
    if (this._value === value) { return; }
    this._value = value;
    this.setText(this.formatValue(value));
  };

  this.getValue = function() {
    return this._value;
  };

  this.formatValue = function(value) {
    switch (this.format) {

      case SceneScoreView.FORMAT_SCORE:
        return value.toFixed(0);
        break;

      case SceneScoreView.FORMAT_TIME:
        return value.toFixed(2).replace(".", ":");
        break;

    }
  };

  this.destroy = function() {
    this.removeFromSuperview();
  };

});

SceneScoreView.FORMAT_SCORE = "formatScore";
SceneScoreView.FORMAT_TIME = "formatTime";