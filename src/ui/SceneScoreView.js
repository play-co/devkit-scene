import ui.ScoreView as ScoreView;
import .PropertyUtil;

/** @lends SceneScoreView */
exports = Class(ScoreView, function(supr) {

  PropertyUtil.addViewProperties(this);

  /**
   * Note: Instances will have all the exposed default style properties from {@link PropertyUtil}
   * @constructs
   * @extends ScoreView
   * @param  {object} opts
   * @param  {string} opts.format A valid `SceneScoreView.FORMAT_` string
   */
  this.init = function(opts) {
    supr(this, 'init', arguments);
    /** @type {string} */
    this.format = opts.format;

    /** @private
        @type {string} */
    this._value = null;

    this.setValue(0);
  };

  /**
   * Set the current value and update the text with the formatted value (only if the value has changed)
   * @param  {string} value
   */
  this.setValue = function(value) {
    if (this._value === value) { return; }
    this._value = value;
    this.setText(this.formatValue(value));
  };

  /**
   * @return {string}
   */
  this.getValue = function() {
    return this._value;
  };

  /**
   * Formats a string based on the current format option set
   * @param  {string} value
   * @return {string}
   */
  this.formatValue = function(value) {
    switch (this.format) {
      case exports.FORMAT_SCORE:
        return this.addCommas(value);
      case exports.FORMAT_TIME:
        return this.formatTimeString(value);
    }
  };

  /**
   * Format to m:ss or h:mm:ss
   * @param  {string} value
   * @return {string}
   */
  this.formatTimeString = function(value) {
    var seconds = value % 60;
    value = (value - seconds) / 60;
    var minutes = value % 60;
    var hours = (value - minutes) / 60;
    var result = seconds.toFixed(2).replace('.', ':');

    if (minutes > 0) {
      result = minutes + ':' + (seconds < 10 ? '0' : '') + result;
    }

    if (hours > 0) {
      result = hours + ':' + (minutes < 10 ? '0' : '') + result;
    }

    return result;
  };

  /**
   * Add commas every three characters from the right
   * @param  {string} value
   * @return {string}
   */
  this.addCommas = function(value) {
    var scoreString = value.toFixed(0);
    var commaSpacing = 3;
    var stringIndex = scoreString.length - commaSpacing;

    while (stringIndex > 0) {
      scoreString = scoreString.substring(0, stringIndex) + ',' + scoreString.substring(stringIndex);
      stringIndex -= commaSpacing;
    }

    return scoreString;
  };

  /** Remove from superview */
  this.destroy = function() {
    this.removeFromSuperview();
  };

});

/** @var {string} SceneScoreView.FORMAT_SCORE */
exports.FORMAT_SCORE = 'formatScore';
/** @var {string} SceneScoreView.FORMAT_TIME */
exports.FORMAT_TIME = 'formatTime';
