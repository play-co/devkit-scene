/**
 * Use a Weeby loop!
 * Warning: Requires access to a Weeby bundle.
 * @method scene.useWeeby
 */
var useWeeby = function() {
  import weeby;
  this.weeby = weeby;

  var _gameView;
  function getGameView() {
    return _gameView || (_gameView = weeby.createGameView(GC.app));
  }

  this.mode('weeby', function () {

  });

  GC.on('app', function () {
    weeby.launchUI();
    weeby.onStartGame = function (data) {
      scene.weebyData = data;
      scene.mode('game');
    };

    scene.mode('weeby');
  });

  Object.defineProperty(scene._appClass.prototype, 'rootView', { get: getGameView });
};

exports = {
  /**
   * Call after all scene setup has been done to signal the usage of the weeby library
   * @var {Boolean} scene.useWeeby
   */
  useWeeby: useWeeby,

  /**
   * Data from the weeby library, if it is being used, otherwise null
   * @type {Object}
   */
  weebyData: null,

  weeby: null
};
