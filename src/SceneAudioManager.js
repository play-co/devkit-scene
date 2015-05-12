import AudioManager;

exports = Class(function() {

  this.init = function() {
    this._audioManager = new AudioManager();
    this._soundGroups = {};
    this._currentlyPlayingMusic = "";
  };

  this.addSound = function(name, path) {
    if (Array.isArray(name)) {
      for (var i = 0; i < name.length; i++) {
        this.addSound(name[i], path);
      }
    } else {
      this._audioManager.addSound(name, { path: path });
    }
  };

  this.addSoundGroup = function(groupId, path) {
    var soundNames = this._soundGroups[groupId] || [];
    for (var i = 2; i < arguments.length; i++) {
      var soundName = arguments[i];
      this.addSound(soundName, path);
      soundNames.push(soundName);
    }
    this._soundGroups[groupId] = soundNames;
  };

  this.addMusic = function(name, path) {
    if (Array.isArray(name)) {
      for (var i = 0; i < name.length; i++) {
        this.addMusic(name[i], path);
      }
    } else {
      this._audioManager.addSound(name, { path: path, background: true });
    }
  };

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

  this.playMusic = function(name) {
    if (scene.weebyData && scene.weebyData.music.effects === false) {
      return;
    }

    this._currentlyPlayingMusic = name;
    this._audioManager.play(name);
  };

  this.stopMusic = function(name) {
    if (this._currentlyPlayingMusic !== "") {
      this._audioManager.stop(this._currentlyPlayingMusic);
      scene._currentlyPlayingMusic = "";
    }
  };

});