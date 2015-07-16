
/**
 * @callback TouchCallback
 * @param {Point}         point         Location of the touch event
 * @param {TouchInstance} touchInstance The touch instance from which the event originates
 */

/** @lends TouchInstance */
exports = Class(function() {

  var VALID_CALLBACKS = ['onTap', 'onDown', 'onUp', 'onMove'];

  /**
   * @constructs
   * @param  {TouchManager} touchManager The parent manager
   * @param  {number}       id           The id assigned by the parent manager
   */
  this.init = function(touchManager, id) {
    /** @type {TouchManager}
        @private */
    this._touchManager = touchManager;
    /** @type {number}
        @private */
    this._id = id;
    /** @type {boolean}
        @private */
    this._isDown = false;

    /** @type {object}
        @private */
    this._callbacks = null;

    /**
     * @type     {object}
     * @property {number} x
     * @property {number} y
     */
    this.pos = { x: 0, y: 0 };
  };

  /**
   * Reset all valid callbacks to empty arrays
   */
  this.reset = function() {
    // Reset the callbacks
    this._callbacks = {};
    for (var i = 0; i < VALID_CALLBACKS.length; i++) {
      var key = VALID_CALLBACKS[i];
      this._callbacks[key] = [];
    }
  };

  /** @var {number} TouchInstance#id
      @readonly */
  Object.defineProperty(this, 'id', {
    enumerable: true,
    get: function() { return this._id; }
  });

  /** @var {boolean} TouchInstance#isDown
      @readonly */
  Object.defineProperty(this, 'isDown', {
    enumerable: true,
    get: function() { return this._isDown; }
  });

  /** @var {number} TouchInstance#x
      @readonly */
  Object.defineProperty(this, 'x', {
    enumerable: true,
    get: function() { return this.pos.x; }
  });

  /** @var {number} TouchInstance#y
      @readonly */
  Object.defineProperty(this, 'y', {
    enumerable: true,
    get: function() { return this.pos.y; }
  });

  /**
   * @param   {TouchCallback} callback
   * @param   {boolean}       [fireOnce]
   * @returns {TouchCallback} callback
   */
  this.onMove = function(cb, fireOnce) {
    this._register('onMove', cb, fireOnce);
    return cb;
  };

  /**
   * Unregister an onMove callback
   * @param {TouchCallback} callback
   */
  this.removeOnMove = function(cb) {
    this._unregister('onMove', cb);
  };

  /**
   * @param   {TouchCallback} callback
   * @param   {boolean}       [fireOnce]
   * @returns {TouchCallback} callback
   */
  this.onDown = function(cb, fireOnce) {
    this._register('onDown', cb, fireOnce);
    return cb;
  };

  /**
   * Unregister an onDown callback
   * @param {TouchCallback} callback
   */
  this.removeOnDown = function(cb) {
    this._unregister('onDown', cb);
  };

  /**
   * @param   {TouchCallback} callback
   * @param   {boolean}       [fireOnce]
   * @returns {TouchCallback} callback
   */
  this.onUp = function(cb, fireOnce) {
    this._register('onUp', cb, fireOnce);
    return cb;
  };

  /**
   * Unregister an onUp callback
   * @param {TouchCallback} callback
   */
  this.removeOnUp = function(cb) {
    this._unregister('onUp', cb);
  };

  /**
   * @param   {TouchCallback} callback
   * @param   {boolean}       [fireOnce]
   * @returns {TouchCallback} callback
   */
  this.onTap = function(cb, fireOnce) {
    this._register('onTap', cb, fireOnce);
    return cb;
  };

  /**
   * Unregister an onTap callback
   * @param {TouchCallback} callback
   */
  this.removeOnTap = function(cb) {
    this._unregister('onTap', cb);
  };

  // ---- ---- ---- //

  /**
   * Sets the isDown and pos properties and fires onDown event
   * @param  {MouseEvent}    event
   * @param  {Point}         point
   */
  this.downHandler = function(event, point) {
    this._isDown = true;
    this.pos = point;
    this._fire('onDown', point);
  };

  /**
   * Unsets the isDown and pos properties and fires onUp event
   * @param  {MouseEvent}    event
   * @param  {Point}         point
   */
  this.upHandler = function(event, point) {
    this._isDown = false;
    this.pos = point;
    this._fire('onUp', point);
  };

  /**
   * Sets the pos property and fires onMove event
   * @param  {MouseEvent}    event
   * @param  {Point}         point
   */
  this.moveHandler = function(event, point) {
    this.pos = point;
    this._fire('onMove', point);
  };

  /**
   * Sets the pos property and fires onTap event
   * @param  {MouseEvent}    event
   * @param  {Point}         point
   */
  this.tapHandler = function(event, point) {
    this.pos = point;
    this._fire('onTap', point);
  };

  /**
   * Register a new callback
   * @private
   * @param  {string}        type     A valid VALID_CALLBACKS string
   * @param  {TouchCallback} cb
   * @param  {boolean}       fireOnce
   */
  this._register = function(type, cb, fireOnce) {
    this._callbacks[type].push({
      cb: cb,
      fireOnce: !!fireOnce
    });
  };

  /**
   * Unregister a callback
   * @private
   * @param  {string}        type     A valid VALID_CALLBACKS string
   * @param  {TouchCallback} cb
   */
  this._unregister = function(type, cb) {
    var callbacks = this._callbacks[type];
    var i = callbacks.indexOf(cb);
    if (i >= 0) {
      callbacks.splice(i, 1);
    }
  };

  /**
   * Emit an event and call all registered callbacks
   * @private
   * @param  {string}        type     A valid VALID_CALLBACKS string
   * @param  {Point} point
   */
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
