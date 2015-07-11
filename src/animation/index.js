import animate;
import animate.transitions as transitions;

/**
 * Array of animation subjects to clear on clean-up
 * @type {Object}
 */
var animSubjects = [];

var addAnimationSubject = function(subject) {
  if (animSubjects.indexOf(subject) === -1) {
    animSubjects.push(subject);
  }
};

var clearSubjectAnimations = function(subject) {
  var anims = subject.__anims;
  if (anims) {
    for (var groupID in anims) {
      animate(subject, groupID).clear();
    }
  }
};

var rotateAround = function(opts) {
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

};

exports = {
  /**
   * Easy access to {@link animate.transitions}
   * @todo Document animate
   */
  transitions: transitions,

  /**
   * Clear all the tracked animations, or a specific subject's animations
   * @method scene.clearAnimations
   * @param {Object} [subject] - optionally clear animations for a specific subject
   */
  clearAnimations: function(subject) {
    if (subject) {
      clearSubjectAnimations(subject);
    } else {
      for (var i = 0; i < animSubjects.length; i++) {
        clearSubjectAnimations(animSubjects[i]);
      }
      animSubjects.length = 0;
    }
  },

  /**
   * @func scene.animate
   * @arg {View}         subject
   * @arg {string}       [groupName]
   * @returns {Animator} anim
   */
  animate: function(subject, groupID) {
    var anim = animate(subject, groupID);
    addAnimationSubject(subject, groupID);
    return anim;
  },

  /**
   * Animate an actor around an x, y position
   * @func AnimationHelper.rotateAround
   * @arg {Object}   opts
   * @arg {Actor}    opts.target        - The target actor you wish to move
   * @arg {number}   opts.x             - The x coordinate of the rotation point
   * @arg {number}   opts.y             - The y coordinate of the rotation point
   * @arg {number}   [opts.duration]    - The duration of the animation
   * @arg {number}   [opts.rotation]    - The amount to rotate
   * @arg {Function} [opts.transition]  - The transition to use for easing
   * @arg {Function} [opts.rotateActor] - The transition to use for easing
   */
  rotateAround: rotateAround,

  __listeners__: [
    {
      event: 'restartUI',
      cb: function() {
        this.clearAnimations();
      }
    }
  ]
};
