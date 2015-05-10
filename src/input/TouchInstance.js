exports = Class(function() {

  this.VALID_CALLBACKS = ['onTap', 'onDown', 'onUp', 'onMove'];

  this.init = function(touchManager, id) {
    this._touchManager = touchManager;
    this._id = id;
    this._isDown = false;
    this.pos = { x: 0, y: 0 };
  };

  this.reset = function() {
    // Reset the callbacks
    this._callbacks = {};
    for (var i = 0; i < this.VALID_CALLBACKS.length; i++) {
      var key = this.VALID_CALLBACKS[i];
      this._callbacks[key] = [];
    }
  };

  Object.defineProperty(this, 'id', {
    get: function() { return this._id; }
  });

  Object.defineProperty(this, 'isDown', {
    get: function() { return this._isDown; }
  });

  /**
   * @callback TouchCallback
   * @param {Point} point - Location of the touch event
   * @param {TouchInstance} touchInstance - The touch instance where the event is originating from
   */

  /**
    * @method TouchInstance#onMove
    * @arg {function} callback
    * @returns {function} callback
    */
  this.onMove = function(cb, fireOnce) {
    this._register('onMove', cb, fireOnce);
    return cb;
  };
  /**
    * @method TouchInstance#removeOnMove
    * @arg {function} callback
    */
  this.removeOnMove = function(cb) {
    this._unregister('onMove', cb);
  };

  /**
    * @method TouchInstance#onDown
    * @arg {function} callback
    * @returns {function} callback
    */
  this.onDown = function(cb, fireOnce) {
    this._register('onDown', cb, fireOnce);
    return cb;
  };
  /**
    * @method TouchInstance#removeOnDown
    * @arg {function} callback
    */
  this.removeOnDown = function(cb) {
    this._unregister('onDown', cb);
  };

  /**
    * @method TouchInstance#onUp
    * @arg {function} callback
    * @returns {function} callback
    */
  this.onUp = function(cb, fireOnce) {
    this._register('onUp', cb, fireOnce);
    return cb;
  };
  /**
    * @method TouchInstance#removeOnUp
    * @arg {function} callback
    */
  this.removeOnUp = function(cb) {
    this._unregister('onUp', cb);
  };

  /**
    * @method TouchInstance#onTap
    * @arg {function} callback
    * @returns {function} callback
    */
  this.onTap = function(cb, fireOnce) {
    this._register('onTap', cb, fireOnce);
    return cb;
  };
  /**
    * @method TouchInstance#removeOnTap
    * @arg {function} callback
    */
  this.removeOnTap = function(cb) {
    this._unregister('onTap', cb);
  };

  // ---- ---- ---- //

  this.downHandler = function(event, point) {
    this._isDown = true;
    this.pos = point;
    this._fire('onDown', point);
  };

  this.upHandler = function(event, point) {
    this._isDown = false;
    this.pos = point;
    this._fire('onUp', point);
  };

  this.moveHandler = function(event, point) {
    this.pos = point;
    this._fire('onMove', point);
  };

  this.tapHandler = function(event, point) {
    this.pos = point;
    this._fire('onTap', point);
  };

  this._register = function(type, cb, fireOnce) {
    this._callbacks[type].push({
      cb: cb,
      fireOnce: !!fireOnce
    });
  };

  this._unregister = function(type, cb) {
    var callbacks = this._callbacks[type];
    var i = callbacks.indexOf(cb);
    if (i >= 0) {
      callbacks.splice(i, 1);
    }
  };

  this._fire = function(type, point) {
    var callbacks = this._callbacks[type];
    for (var i = callbacks.length - 1; i >= 0; i--) {
      var cbObject = callbacks[i];
      cbObject.cb(point, this);

      if (cbObject.fireOnce) {
        callbacks.splice(i, 1);
      }
    }
  };

});
