import .Actor;
import .SATActor;

exports = {
  /**
   * Change the default class for actors
   * @method scene.setActorCtor
   * @param  {Class} actorCtor
   */
  setActorCtor: function(actorCtor) {
    scene._actorCtor = actorCtor;
  },

  /**
   * Create a new actor that will be automatically updated each tick
   * @method  scene.addActor
   * @param   {String|Object} resource - resource key to be resolved by community art, or opts
   * @param   {Object}        [opts]   - contains options to be applied to the underlying {@link Actor}
   * @returns {Actor}
   */
  /**
   * @method  scene.addActor(2)
   * @param   {View}   view
   * @param   {Object} [opts] - contains options to be applied to the underlying {@link Actor}
   * @returns {Actor}
   */
  addActor: function(resource, opts) {
    return scene.group.addActor(resource, opts);
  },

  /**
   * Easy access to actor classes
   * @var      {Object}   scene.actor
   * @property {Actor}    scene.actor.Actor
   * @property {SATActor} scene.actor.SAT
   */
  actor: {
    Actor: Actor,
    SAT: SATActor
  },
  _actorCtor: Actor
};
