import .Group;
import scene.actor.Actor as Actor;

var _customActorGroups = {};
var _groupUID = 0;

/** @lends scene */
exports = {

  /**
   * @type {object}
   * @property {Class} _actorCtor
   */
  groupConfig: {
    _actorCtor: Actor
  },

  /**
   * Change the default class for actors
   * @param  {Class} actorCtor
   */
  setActorCtor: function (actorCtor) {
    this.groupConfig._actorCtor = actorCtor;
  },

  /**
   * Create a new actor in the defualt scene group
   * @see Group#addActor
   */
  addActor: function (opts, instOpts) {
    return this.group.addActor(opts, instOpts);
  },

  /**
   * Add a new actor group to scene tracking
   * @param   {object} [opts]
   * @returns {Group}
   */
  addGroup: function (opts) {
    opts = opts || {};
    opts.superview = this.stage;
    var result = new Group(opts);
    this.groups.push(result);
    return result;
  },

  /**
   * Automatically obtain a group for this class, and return an actor instance from that group.
   * This function provides an easy way to add custom actors to scene.
   * @param   {Actor}  ctor
   * @param   {object} [opts] see Group#addActor
   * @returns {Actor}  newInstance
   */
  addCustomActor: function (ctor, opts, instOpts) {
    var lookupName = ctor.name || ctor.__groupUID;
    if (!lookupName) {
      ctor.__groupUID = _groupUID++;
    }

    var group = _customActorGroups[lookupName];
    if (!group) {
      _customActorGroups[lookupName] = group = scene.addGroup({ ctor: ctor });
    }

    return group.addActor(opts, instOpts);
  },

  /**
   * The default group for actors (if no other group is used).
   * @type Group
   */
  group: null,

  /**
   * Array holding all groups from {@link scene.addGroup}
   * @type {Group[]}
   */
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
      cb: function () {
        this.group.destroy(false);

        for (var i in this.groups) {
          this.groups[i].destroy(false);
        }

        this.groups = [];
        _customActorGroups = {};
      }
    },
    // Tick
    {
      event: 'tickSec',
      cb: function (dt) {
        this.group.update(dt);
        for (var i = 0; i < this.groups.length; i++) {
          this.groups[i].update(dt);
        }
      }
    }
  ]

};
