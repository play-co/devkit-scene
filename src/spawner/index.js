import .HorizontalSpawner;
import .VerticalSpawner;
import .Spawner;

/** @lends scene */
exports = {
  /**
   * Will add a new spawner to the scene default group.
   * @arg     {Spawner} spawner
   * @returns {Spawner}
   * @see     {Group#addSpawner}
   */
  addSpawner: function(spawner) {
    return this.group.addSpawner(spawner);
  },

  /**
   * Will remove a spawner from the scene default group.
   * @arg     {Spawner} spawner
   * @returns {Spawner}
   * @see     {Group#removeSpawner}
   */
  removeSpawner: function(spawner) {
    return this.group.removeSpawner(spawner);
  },

  /**
   * Easy access to spawner classes
   * @prop {Spawner}      spawner.Timed
   * @prop {HorizontalSpawner} spawner.Horizontal
   * @prop {VerticalSpawner}   spawner.Vertical
   */
  spawner: {
    Horizontal: HorizontalSpawner,
    Vertical: VerticalSpawner,
    Timed: Spawner
  }
};
