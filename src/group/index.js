import .Group;

exports = {
  /**
   * Add a new actor group to scene tracking
   * @func    scene.addGroup
   * @arg     {Object} [opts]
   * @returns {Group}
   */
  addGroup: function(opts) {
    opts = opts || {};
    opts.superview = GC.app.stage;
    var result = new Group(opts);
    scene.groups.push(result);
    return result;
  },

  /**
   * The default group for actors (if no other group is used).
   * @var {Group} scene.group
   */
  group: null,

  __listeners__: [
    {
      event: 'init',
      priority: 100,
      cb: function (app) {
        this.group = new Group({superview: this.stage});
      }
    }
  ]
};
