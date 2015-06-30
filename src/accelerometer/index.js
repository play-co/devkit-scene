import accelerometer;

/**
 * @var {Boolean} _accelerometerStarted
 * @private
 */
var _accelerometerStarted = false;
/**
 * @var {Boolean} _accelerometerHandlers
 * @private
 */
var _accelerometerHandlers = [];

exports = {

  /**
   * @typedef {Object} AccellerometerData
   * @property {Number} x
   * @property {Number} y
   * @property {Number} z
   * @property {Number} forwardTilt
   * @property {Number} tilt
   * @property {Number} twist
   */
  /**
   * Called every tick with accellerometer data
   * @callback onAccelerometerCallback
   * @arg {AccellerometerData} e
   */
  /**
   * Register a new accelerometer callback
   * @func scene.onAccelerometer
   * @arg {onAccelerometerCallback} callback
   */
  onAccelerometer: function(cb) {
    if (!_accelerometerStarted) {
      _accelerometerStarted = true;
      _accelerometerHandlers = [];

      accelerometer.on('devicemotion', function (evt) {

        var x = (evt.accelerationIncludingGravity.x - evt.acceleration.x) / 10;
        var y = (evt.accelerationIncludingGravity.y - evt.acceleration.y) / 10;
        var z = (evt.accelerationIncludingGravity.z - evt.acceleration.z) / 10;

        var accelObj = {
          x: x,
          y: y,
          z: z,
          forwardTilt: Math.atan2(z, y),
          tilt: Math.atan2(x, y),
          twist: Math.atan2(x, z),
        };

        // Update all the handlers!
        var accelCallbacks = _accelerometerHandlers;
        for (var i = 0; i < accelCallbacks.length; ++i) {
          accelCallbacks[i](accelObj);
        }
      });
    }

    _accelerometerHandlers.push(cb);
  },

  /**
   * Stop and clear accelerometer handlers.
   * @method scene.stopAccelerometer
   */
  stopAccelerometer: function() {
    if (_accelerometerStarted) {
      accelerometer.stop();
      _accelerometerStarted = false;
    }
  }

};
