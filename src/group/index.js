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
  }
};
