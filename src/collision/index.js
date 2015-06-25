import .CollisionManager;
import .CollisionChecker;

exports = {
  /**
   * The collision manager is responsible for tracking all scene collisions.
   * @var {CollisionManager} scene.collisions
   * @see scene.onCollision
   */
  collisions: new CollisionManager(),

  /**
   * This collision check will be run each tick. The callback will be called only once per tick by default.
   * @func scene.onCollision
   * @arg {Actor|Actor[]|Group|Collidable} a
   * @arg {Actor|Actor[]|Group|Collidable} b
   * @arg {onCollisionCallback}            callback
   * @arg {boolean}                        [allCollisions] - {@link callback} may be called more than once per tick
   * @returns {number} collisionCheckID
   * @see CollisionChecker
   */
  onCollision: function(a, b, callback, allCollisions) {
    // create a new collision checker
    var check = new CollisionChecker({
      a: a,
      b: b,
      callback: callback,
      allCollisions: allCollisions
    });

    return this.collisions.registerCollision(check);
  },

  /**
   * Easy access to collision classes
   * @var  {Object}             scene.collision
   * @prop {CollisionChecker}   scene.collision.CollisionChecker
   */
  collision: {
    CollisionChecker: CollisionChecker
  }
};
