import .HorizontalSpawner;
import .VerticalSpawner;
import .Spawner;

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
   * @var  {Object}     scene.spawner
   * @prop {Timed}      scene.spawner.Spawner
   * @prop {Horizontal} scene.spawner.Horizontal
   * @prop {Vertical}   scene.spawner.Vertical
   */
  spawner: {
    Horizontal: HorizontalSpawner,
    Vertical: VerticalSpawner,
    Timed: Spawner
  }
};
