import .SceneAudioManager;

var audioManager = new SceneAudioManager();

/** @lends scene */
exports = {

  /**
   * The default scene audio manager. Used to register your games sounds and music.
   * @type {SceneAudioManager}
   */
  audio: audioManager,

  /**
   * Add a new sound effect to your game.
   * @type {function}
   * @see SceneAudioManager#addSound
   */
  addSound: bind(audioManager, 'addSound'),

  /**
   * @todo Idk what a sound group is
   * @type {function}
   * @see SceneAudioManager#addSoundGroup
   */
  addSoundGroup: bind(audioManager, 'addSoundGroup'),

  /**
   * Add a new background music track to your game.
   * @type {function}
   * @see SceneAudioManager#addMusic
   */
  addMusic: bind(audioManager, 'addMusic'),

  /**
   * Play a registered sound.
   * @type {function}
   * @see SceneAudioManager#playSound
   */
  playSound: bind(audioManager, 'playSound'),

  /**
   * Play a registered music track.
   * @type {function}
   * @see SceneAudioManager#playMusic
   */
  playMusic: bind(audioManager, 'playMusic'),

  /**
   * Stop a playing music track.
   * @type {function}
   * @see SceneAudioManager#stopMusic
   */
  stopMusic: bind(audioManager, 'stopMusic')

};
