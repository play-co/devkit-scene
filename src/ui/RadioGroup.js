
exports = Class(function() {

  /**
   * Radio groups should be used when you want only one button to be selected in a group of buttons
   * @class RadioGroup
   */
  this.init = function() {
    this._buttons = [];
  };

  /**
   * @method RadioGroup#addButton
   * @arg {Button|Button[]} button
   */
  this.addButton = function(button) {
    if (Array.isArray(button)) {
      button.forEach(this.addButton);
      return;
    }

    this._buttons.push(button);
    button.registerListener('onDown', function() {
      this._onDown(button);
    }.bind(this));
  };

  /**
   * @private
   * @method RadioGroup#_onDown
   * @arg {Button} button
   */
  this._onDown = function(button) {
    this._buttons.forEach(function(iterButton) {
      if (iterButton === button) return;
      iterButton.setPressed(false);
    });
  };
});
