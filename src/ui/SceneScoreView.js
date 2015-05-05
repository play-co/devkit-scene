import ui.ScoreView as ScoreView;
import .PropertyUtil;

var SceneScoreView = exports = Class(ScoreView, function(supr) {

  PropertyUtil.addViewProperties(this);

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
        return this.addCommas(value);

      case SceneScoreView.FORMAT_TIME:
        return this.formatTimeString(value);

    }
  };

  this.formatTimeString = function(value) {
    var seconds = value % 60;
    value = (value - seconds) / 60;
    var minutes = value % 60;
    var hours = (value - minutes) / 60;
    var result = seconds.toFixed(2).replace(".", ":");

    if (minutes > 0) {
      result = minutes + ":" + (seconds < 10 ? "0" : "") + result;
    }

    if (hours > 0) {
      result = hours + ":" + (minutes < 10 ? "0" : "") + result;
    }

    return result;
  };

  this.addCommas = function(value) {
    // Add commas to our score, and set the text on the score view
    var scoreString = value.toFixed(0);
    var commaSpacing = 3;
    var stringIndex = scoreString.length - commaSpacing;

    while (stringIndex > 0) {
      scoreString = scoreString.substring(0, stringIndex) + "," + scoreString.substring(stringIndex);
      stringIndex -= commaSpacing;
    }

    return scoreString;
  };

  this.destroy = function() {
    this.removeFromSuperview();
  };

});

SceneScoreView.FORMAT_SCORE = "formatScore";
SceneScoreView.FORMAT_TIME = "formatTime";