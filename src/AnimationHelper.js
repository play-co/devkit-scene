import animate;
import animate.transitions as transitions;

/**
 * @var {String[]} scene.animationGroups - Animation groups to be tracked and auto cleaned up by scene
 * @default ['scene']
 */
var animationGroups = ['scene'];

exports = function(subject, groupId) {
  groupId = groupId === undefined ? "scene" : "scene_" + groupId;
  var anim = animate(subject, groupId);
  if (groupId !== "scene" && animationGroups.indexOf(groupId) === -1) {
    animationGroups.push(groupId);
  }
  if (subject._addAnimationGroup) {
    subject._addAnimationGroup(groupId);
  }
  return anim;
};

/**
 * Clear all the tracked animation groups
 * @method scene.clearAnimations
 */
exports.clearAnimations = function() {
  if (animationGroups) {
    // Clear old animaion groups
    for (var i = 0; i < animationGroups.length; i++) {
      var group = animate.getGroup(animationGroups[i]);
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
  animationGroups = ['scene'];
};

/**
 * Animate an actor around an x, y position
 * @func AnimationHelper.rotateAround
 * @arg {Object}  [opts]
 * @arg {Actor}  [opts.target] - The target actor you wish to move
 * @arg {number}  [opts.x] - The x coordinate of the rotation point
 * @arg {number}  [opts.y] - The y coordinate of the rotation point
 * @arg {number}  [opts.duration] - The duration of the animation
 * @arg {number}  [opts.rotation] - The amount to rotate
 * @arg {Function} [opts.transition] - The transition to use for easing
 */
exports.rotateAround = function(opts) {
  var target = opts.target;
  var x = opts.x;
  var y = opts.y;
  var duration = opts.duration || 0;
  var rotation = opts.rotation || 0;
  var transition = opts.transition || transitions.linear;
  var rotateActor = opts.rotateActor || false;
  var dx = target.x - x;
  var dy = target.y - y;
  var distance = Math.sqrt(dx * dx + dy * dy);
  var startAngle = Math.atan2(dy, dx);

  if (duration === 0) {
    var endAngle = startAngle + rotation;
    target.x = x + Math.cos(endAngle) * distance;
    target.y = y + Math.sin(endAngle) * distance;
  } else {
    scene.animate(target, 'rotateAround').now({}, duration, transition, function(tt) {
      var targetAngle = startAngle + rotation * tt;
      target.x = x + Math.cos(targetAngle) * distance;
      target.y = y + Math.sin(targetAngle) * distance;
    });
  }

};



