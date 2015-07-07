import .Actor;
import .SATActor;

exports = {
  /**
   * Easy access to actor classes
   * @var      {Object}   scene.actor
   * @property {Actor}    scene.actor.Actor
   * @property {SATActor} scene.actor.SAT
   */
  actor: {
    Actor: Actor,
    SAT: SATActor
  }
};
