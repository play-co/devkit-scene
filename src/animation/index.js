import animate;
import animate.transitions as transitions;

/**
 * Map of subject instances -> animation groupId
 * @type {object}
 */
var subjectAnimations = {}

var addSubjectAnimation = function(subject, groupId) {
  var subjectKey = subject.__anim_id;
  if (subjectKey === undefined) {
    throw new Error('Cannot add subject animation, no __anim_id present on the subject.');
  }

  if (!subjectAnimations[subjectKey]) {
    subjectAnimations[subjectKey] = [groupId];
  } else {
    var animationGroups = subjectAnimations[subjectKey];
    if (animationGroups.indexOf(groupId) === -1) {
      animationGroups.push(groupId);
    }
  }
};

var clearSubjectAnimations = function(subject) {
  var subjectKey = subject.__anim_id || "";
  var animationGroups = subjectAnimations[subjectKey];
  if (animationGroups) {
    for (var i = 0, len = animationGroups.length; i < len; i++) {
      animate(subject, animationGroups[i]).clear();
    }
    delete subjectAnimations[subjectKey];
  }
};


/** @lends scene */
exports = {

  /**
   * Easy access to {@link animate.transitions}
   * @type {object}
   * @todo Document animate
   */
  transitions: transitions,

  /**
   * Animation groups to be tracked and auto cleaned up by scene
   * @type {string[]}
   * @default ['scene']
   */
  // TODO: seems like this calls for ... another manager!
  animationGroups: null,

  /**
   * Clear all the tracked animation groups, or a specific subject's animations
   * @param {object} [subject] Optionally clear animations for a specific subject
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
   * @param  {View}       subject
   * @param  {string}     [groupName]
   * @return {Animator}   anim
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

  /**
   * Animate an actor around an x, y position
   * @param {object}   opts
   * @param {Actor}    opts.target        The target actor you wish to move
   * @param {number}   opts.x             The x coordinate of the rotation point
   * @param {number}   opts.y             The y coordinate of the rotation point
   * @param {number}   [opts.duration]    The duration of the animation
   * @param {number}   [opts.rotation]    The amount to rotate
   * @param {function} [opts.transition]  The transition to use for easing
   * @param {function} [opts.rotateActor] Set to true to update actor rotation as well as position
   */
  rotateAround: function(opts) {
    var target = opts.target;
    var x = opts.x;
    var y = opts.y;
    var duration = opts.duration || 0;
    var rotation = opts.rotation || 0;
    var transition = opts.transition || transitions.linear;
    var rotateActor = opts.rotateActor || false;
    var actorRotation = target.rotation;
    var dx = target.x - x;
    var dy = target.y - y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var startAngle = Math.atan2(dy, dx);

    if (duration === 0) {
      var endAngle = startAngle + rotation;
      target.x = x + Math.cos(endAngle) * distance;
      target.y = y + Math.sin(endAngle) * distance;
      target.rotation += rotation;
    } else {
      this.animate(target, 'rotateAround').now({}, duration, transition, function(tt) {
        var targetAngle = startAngle + rotation * tt;
        target.x = x + Math.cos(targetAngle) * distance;
        target.y = y + Math.sin(targetAngle) * distance;
        if (rotateActor) { target.rotation = actorRotation + rotation * tt; }
      });
    }
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
