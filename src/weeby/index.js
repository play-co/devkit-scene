/** @lends scene */
exports = {

  /**
   * Data from the weeby library, if it is being used, otherwise null
   * @type Object
   * @default null
   */
  weebyData: null,

  /**
   * Use a Weeby loop!
   * Warning: Requires access to a Weeby bundle.
   */
  useWeeby: function() {
    import weeby;

    var _gameView;
    function getGameView() {
      return _gameView || (_gameView = weeby.createGameView(GC.app));
    }

    this.mode('weeby', function () {
      weeby.launchUI();
      weeby.onStartGame = function (data) {
        scene.weebyData = data;
        scene.mode('default');
      };
    });

    GC.on('app', function () {
      scene.mode('weeby');
    });

    Object.defineProperty(scene._appClass.prototype, 'rootView', { get: getGameView });
  }

};
