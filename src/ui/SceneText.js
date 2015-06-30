import ui.TextView as TextView;

exports = Class("SceneText", TextView, function(supr) {

  this.destroy = function() {
    scene.setTextColor('white');
    scene.removeText(this);
  };

});