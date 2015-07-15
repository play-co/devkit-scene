import .CollisionManager;
import .CollisionChecker;

/** @lends scene */
exports = {

  /**
   * The collision manager is responsible for tracking all scene collisions.
   * @type CollisionManager
   * @see scene.onCollision
   */
  collisions: new CollisionManager(),

  /**
   * This collision check will be run each tick. The callback will be called only once per tick by default.
   * @method scene.onCollision
   * @param  {Actor|Actor[]|Group|Collidable} a
   * @param  {Actor|Actor[]|Group|Collidable} b
   * @param  {onCollisionCallback}            callback
   * @param  {boolean}                        [allCollisions] - {@link callback} may be called more than once per tick
   * @return {number} collisionCheckID
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
   * @type object
   * @property {CollisionChecker} CollisionChecker
   */
  collision: {
    CollisionChecker: CollisionChecker
  },

  __listeners__: [
    // Restart
    {
      event: 'restartGame',
      cb: function() {
        this.collisions.reset();
      }
    },
    // Tick
    {
      event: 'tickSec',
      cb: function(dt) {
        this.collisions.update();
      }
    }
  ]

};
