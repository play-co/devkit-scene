import animate;
import animate.transitions as transitions;

/**
 * Map of subject instances -> animation groupId
 * @type {Object}
 */
var subjectAnimations = {}

var addSubjectAnimation = function(subject, groupId) {
  if (!subjectAnimations[subject]) {
    subjectAnimations[subject] = [groupId];
  } else {
    var animationGroups = subjectAnimations[subject];
    if (animationGroups.indexOf(groupId) === -1) {
      animationGroups.push(groupId);
    }
  }
};

this.clearSceneAnimations = function(subject) {
  var animationGroups = subjectAnimations[subject];
  for (var i = 0, len = animationGroups.length; i < len; i++) {
    animate(subject, animationGroups[i]).clear();
  }

  delete subjectAnimations[subject];
};

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
   * Clear all the tracked animation groups, or a specific subject's animations
   * @method scene.clearAnimations
   * @param {Object} [subject] - optionally clear animations for a specific subject
   */
  clearAnimations: function(subject) {
    if (subject) {
      clearSubjectAnimations(subject);
    } else {
      if (this.animationGroups) {
        // Clear old animaion groups
        for (var i = 0; i < this.animationGroups.length; i++) {
          var group = animate.getGroup(this.animationGroups[i]);
          if (!group) { continue; }
          var animations = group._anims;
          for (var key in animations) {
            animations[key].commit();
            animations[key].clear();
            delete animations[key];
          }
        }
      }

      // Reset
      this.animationGroups = ['scene'];
      subjectAnimations = {};
    }
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
    if (groupId !== "scene" && this.animationGroups.indexOf(groupId) === -1) {
      this.animationGroups.push(groupId);
    }

    // For individual subject animation tracking
    addSubjectAnimation(subject, groupId);

    return anim;
  },

  __listeners__: [
    {
      event: 'restartUI',
      cb: function() {
        this.clearAnimations();
      }
    }
  ]
};
