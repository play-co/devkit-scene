import AudioManager;

/** @lends SceneAudioManager */
exports = Class(function() {

  /**
   * @constructs
   */
  this.init = function() {
    /** @type {AudioManager}
        @private */
    this._audioManager = new AudioManager();
    /** @type {object}
        @private */
    this._soundGroups = {};
    /** @type {string}
        @private */
    this._currentlyPlayingMusic = '';
  };

  /**
   * @param  {string}          name
   * @param  {string|string[]} path
   */
  this.addSound = function(name, path) {
    if (Array.isArray(name)) {
      for (var i = 0; i < name.length; i++) {
        this.addSound(name[i], path);
      }
    } else {
      this._audioManager.addSound(name, { path: path });
    }
  };

  /**
   * @param  {string} groupId
   * @param  {string} path
   */
  this.addSoundGroup = function(groupId, path) {
    var soundNames = this._soundGroups[groupId] || [];
    for (var i = 2; i < arguments.length; i++) {
      var soundName = arguments[i];
      this.addSound(soundName, path);
      soundNames.push(soundName);
    }
    this._soundGroups[groupId] = soundNames;
  };

  /**
   * @param  {string} name
   * @param  {string} path
   */
  this.addMusic = function(name, path) {
    if (Array.isArray(name)) {
      for (var i = 0; i < name.length; i++) {
        this.addMusic(name[i], path);
      }
    } else {
      this._audioManager.addSound(name, { path: path, background: true });
    }
  };

  /**
   * @param  {string} name
   */
  this.playSound = function(name) {
    if (scene.weebyData && scene.weebyData.sound.effects === false) {
      return;
    }

    var soundNames = this._soundGroups[name];
    if (soundNames) {
      name = soundNames[ Math.floor(Math.random() * soundNames.length) ];
    }
    this._audioManager.play(name);
  };

  /**
   * @param  {string} name
   */
  this.playMusic = function(name) {
    if (scene.weebyData && scene.weebyData.music.effects === false) {
      return;
    }

    this._currentlyPlayingMusic = name;
    this._audioManager.play(name);
  };

  /**
   * @param  {string} name
   */
  this.stopMusic = function(name) {
    if (this._currentlyPlayingMusic !== '') {
      this._audioManager.stop(this._currentlyPlayingMusic);
      scene._currentlyPlayingMusic = '';
    }
  };

});
