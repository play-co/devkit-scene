import animate;
import animate.transitions as transitions;

exports = {
  /**
   * Easy access to {@link animate.transitions}
   * @todo Document animate
   */
  transitions: transitions,

  /**
   * @var {String[]} scene.animationGroups - Animation groups to be tracked and auto cleaned up by scene
   * @default ['scene']
   */
  // TODO: seems like this calls for ... another manager!
  animationGroups: null,

  /**
   * Clear all the tracked animation groups
   * @method scene.clearAnimations
   */
  clearAnimations: function() {
    if (scene.animationGroups) {
      // Clear old animaion groups
      for (var i = 0; i < scene.animationGroups.length; i++) {
        var group = animate.getGroup(scene.animationGroups[i]);
        if (!group) { continue; }
        var animations = group._anims;
        for (var key in animations) {
          animations[key].commit();
          animations[key].clear();
          delete animations[key];
        }
      }
    }

    // Reset array
    scene.animationGroups = ['scene'];
  },

  /**
   * @func scene.animate
   * @arg {View}         subject
   * @arg {string}       [groupName]
   * @returns {Animator} anim
   */
  animate: function(subject, groupId) {
    groupId = groupId === undefined ? "scene" : "scene_" + groupId;
    var anim = animate(subject, groupId);
    if (groupId !== "scene" && scene.animationGroups.indexOf(groupId) === -1) {
      scene.animationGroups.push(groupId);
    }
    return anim;
  }
};
