import .Group;
import scene.actor.Actor as Actor;

var _conglomorateGroups = null;

var conglomorate = function(ctor, opts) {
  if (!_conglomorateGroups) { throw new Error('conglomorate groups not yet initilized'); }

  var lookupName = ctor.name;
  if (!lookupName) { console.error(ctor); throw new Error('no name available on ctor'); }

  var group = _conglomorateGroups[lookupName];
  if (!group) {
    _conglomorateGroups[lookupName] = group = scene.addGroup({ ctor: ctor });
  }

  return group.addActor(null, opts);
};

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
   * Create a new actor in the defualt scene group
   * @method  scene.addActor
   * @see Group#addActor
   */
  addActor: function(resource, opts) {
    return this.group.addActor(resource, opts);
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
   * Automatically obtain a group for this class, and return an actor instance from that group.
   * This function provides an easy way to add custom actors to scene.
   * @func scene.conglomorate
   * @arg     {Actor}  ctor
   * @arg     {object} [opts]
   * @returns {Actor}  newInstance
   */
  conglomorate: conglomorate,

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

        _conglomorateGroups = {};
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
