/** @lends scene */
exports = {

  /**
   * Data from the weeby library, if it is being used, otherwise null
   * @type Object
   * @default null
   */
  weebyData: null,
  weeby: null,

  /**
   * Use a Weeby loop!
   * Warning: Requires access to a Weeby bundle.
   */
  useWeeby: function() {
    import weeby;
    scene.weeby = weeby;

    this.mode('weeby', function () {
      weeby.setGameView(scene.view);

      weeby.launchUI();
      weeby.onStartGame = function (data) {
        scene.weebyData = data;
        scene.mode('default');
      };
    });

    GC.on('app', function () {
      scene.mode('weeby');
    });
  },

  weebyGameOver: function() {
    scene.weeby.finishGame({ score: this.getScore() });
  }

};
