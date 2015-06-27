/**
 * Use a Weeby loop!
 * Warning: Requires access to a Weeby bundle.
 * @method scene.useWeeby
 */
var useWeeby = function() {
  import device;
  import weeby;
  import ui.View;

  var _gameView;
  function getGameView() {
    return _gameView || (_gameView = weeby.createGameView(GC.app));
  }

  this.mode('weeby', function () {
    weeby.launchUI();
    weeby.onStartGame = function (data) {
      // TODO: This is temporary until the state manager / reset funcitonality get refactored
      //         to include an opts object.  The reset logic currently is very dirty
      scene.weebyData = data;
      scene.mode('default');
    };
  });

  GC.on('app', function () {
    scene.mode('weeby');
  });

  Object.defineProperty(scene._appClass.prototype, 'rootView', { get: getGameView });

  this._useWeeby = true;
};

exports = {
  /**
   * Whether or not the game will be using an included Weeby loop
   * @var {Boolean} scene._useWeeby
   */
  // TODO: This is a bit of a hack, make it better.
  // Make scene.gameOver better
  _useWeeby: false,
  useWeeby: useWeeby
};
