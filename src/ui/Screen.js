import entities.shapes.Rect as Rect;

import scene.input.TouchManager as TouchManager;

exports = Class(Rect, function(supr) {

  /**
    * @class Screen
    * @param {Number} width
    * @param {Number} height
    */
  this.init = function(width, height) {
    var suprOpts = {
      width: width,
      height: height
    };
    supr(this, "init", [suprOpts]);

    /** @var {TouchManager} Screen#touchManager */
    this.touchManager = new TouchManager();

    /**
     * A number of shortcut methods are provided on screen, which are calling the corresponding method on the default touch instance.
     * If you want to attach functionality to other touches as well, you can access them from {@link Screen#touchManager}
     * @var {TouchInstance} Screen#defaultTouch
     */
    this.defaultTouch = this.touchManager.touchInstances[0];
    /** @method Screen#onDown
        @see    TouchInstance#onDown */
    this.onDown       = bind(this.defaultTouch, this.defaultTouch.onDown);
    /** @method Screen#removeOnDown
        @see    TouchInstance#removeOnDown */
    this.removeOnDown = bind(this.defaultTouch, this.defaultTouch.removeOnDown);

    /** @method Screen#onUp
        @see    TouchInstance#onUp */
    this.onUp         = bind(this.defaultTouch, this.defaultTouch.onUp);
    /** @method Screen#removeOnDown
        @see    TouchInstance#removeOnDown */
    this.removeOnUp   = bind(this.defaultTouch, this.defaultTouch.removeOnUp);

    /** @method Screen#onMove
        @see    TouchInstance#onMove */
    this.onMove       = bind(this.defaultTouch, this.defaultTouch.onMove);
    /** @method Screen#removeOnMove
        @see    TouchInstance#removeOnMove */
    this.removeOnMove = bind(this.defaultTouch, this.defaultTouch.removeOnMove);

    /** @method Screen#onTap
        @see    TouchInstance#onTap */
    this.onTap        = bind(this.defaultTouch, this.defaultTouch.onTap);
    /** @method Screen#removeOnTap
        @see    TouchInstance#removeOnTap */
    this.removeOnTap  = bind(this.defaultTouch, this.defaultTouch.removeOnTap);
  };

  /** @method Screen#reset */
  this.reset = function() {
    this.touchManager.reset();
  };

});
