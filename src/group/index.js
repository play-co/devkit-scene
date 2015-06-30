import .Group;
import scene.actor.Actor as Actor;

exports = {
  groupConfig: {
    _actorCtor: Actor
  },

  /**
   * Change the default class for actors
   * @method scene.setActorCtor
   * @param  {Class} actorCtor
   */
  setActorCtor: function(actorCtor) {
    this.groupConfig._actorCtor = actorCtor;
  },

  /**
   * Add a new actor group to scene tracking
   * @func    scene.addGroup
   * @arg     {Object} [opts]
   * @returns {Group}
   */
  addGroup: function(opts) {
    opts = opts || {};
    opts.superview = this.stage;
    var result = new Group(opts);
    this.groups.push(result);
    return result;
  },

  /**
   * The default group for actors (if no other group is used).
   * @var {Group} scene.group
   */
  group: null,

  groups: null,

  __listeners__: [
    {
      event: 'initGame',
      cb: function () {
        this.group = new Group({superview: this.stage});
      }
    },
    // Restart
    {
      event: 'restartGame',
      cb: function() {
        this.group.destroy(false);

        for (var i in this.groups) {
          this.groups[i].destroy(false);
        }

        this.groups = [];
      }
    },
    // Tick
    {
      event: 'tickSec',
      cb: function(dt) {
        this.group.update(dt);
        for (var i = 0; i < this.groups.length; i++) {
          this.groups[i].update(dt);
        }
      }
    }
  ]
};
