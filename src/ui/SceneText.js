import ui.TextView as TextView;

/**
 * @class SceneText
 * @extends TextView
 */
exports = Class('SceneText', TextView, function(supr) {

  /**
   * Sets the default scene text color to white and then removes self from scene.
   * @method SceneText#destroy
   */
  this.destroy = function() {
    scene.setTextColor('white');
    scene.removeText(this);
  };

});
