import .SceneAudioManager;

/**
 * The default scene audio manager. Used to register your games sounds and music.
 * @var {SceneAudioManager} scene.audio
 */
var audioManager = new SceneAudioManager();
/**
 * Add a new sound effect to your game.
 * @method scene.addSound
 * @see SceneAudioManager#addSound
 */
var addSound = bind(audioManager, 'addSound');
/**
 * @todo Idk what a sound group is
 * @method scene.addSoundGroup
 * @see SceneAudioManager#addSoundGroup
 */
var addSoundGroup = bind(audioManager, 'addSoundGroup');
/**
 * Add a new background music track to your game.
 * @method scene.addMusic
 * @see SceneAudioManager#addMusic
 */
var addMusic = bind(audioManager, 'addMusic');
/**
 * Play a registered sound.
 * @method scene.playSound
 * @see SceneAudioManager#playSound
 */
var playSound = bind(audioManager, 'playSound');
/**
 * Play a registered music track.
 * @method scene.playMusic
 * @see SceneAudioManager#playMusic
 */
var playMusic = bind(audioManager, 'playMusic');
/**
 * Stop a playing music track.
 * @method scene.stopMusic
 * @see SceneAudioManager#stopMusic
 */
var stopMusic = bind(audioManager, 'stopMusic');

exports = {
  audio: audioManager,
  addSound: addSound,
  addSoundGroup: addSoundGroup,
  addMusic: addMusic,
  playSound: playSound,
  playMusic: playMusic,
  stopMusic: stopMusic
};
