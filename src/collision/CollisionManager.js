
/**
  * Responsible for updating, and manging collision checks.
  * Collisions are registered as 2 things, `a` and `b`; the check is the run every tick to see if
  * `a` and `b` have collided.
  * {@link CollisionManager#stop}, {@link CollisionManager#start}, {@link CollisionManager#remove}
  * are exposed in case you want to control the collisions manually, however the Collision Manager is
  * smart about running collisions. If a group, `a` or `b`, is a single {@link Actor} or an array of
  * {@link Actor}s, then the collision manager will automatically remove the check when actors in question
  * are destroyed.
  * @class CollisionManager
  */
exports = function() {

  /**
    * @typedef Collidable
    * @mixin
    * @todo idk what this type is supposed to have...
    */
  /**
    * Called when a collision occurs
    * @callback onCollisionCallback
    * @arg {Actor} a
    * @arg {Actor} b
    */
  /**
    * This collision check will be run each tick. {@link callback} will be called only once per tick
    * @func CollisionManager#check
    * @arg {Actor|Actor[]|Group|Collidable} a
    * @arg {Actor|Actor[]|Group|Collidable} b
    * @arg {onCollisionCallback} callback
    * @arg {boolean} [allCollisions] - {@link callback} may be called more than once per tick
    * @returns {number} collisionCheckID
    */
  this.check = function(a, b, callback, allCollisions) {};

  /**
    * Fully remove the collision check, cannot subsequently call {@link CollisionManager#start}
    * @func CollisionManager#remove
    * @arg {number} collisionCheckID
    */
  this.remove = function(collisionCheckID) {};

  /**
    * Temporarily stop a collision from being checked, do not unregister it.
    * @func CollisionManager#stop
    * @arg {number} collisionCheckID
    */
  this.stop = function(collisionCheckID) {};

  /**
    * Start a collision being checked. No need to call this unless {@link CollisionManager#stop} has been called
    * @func CollisionManager#start
    * @arg {number} collisionCheckID
    */
  this.start = function(collisionCheckID) {};

};
