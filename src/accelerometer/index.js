import accelerometer;

/**
 * @typedef  {object} AccellerometerData
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {number} forwardTilt
 * @property {number} tilt
 * @property {number} twist
 */
/**
 * Called every tick with accellerometer data
 * @callback onAccelerometerCallback
 * @param {AccellerometerData} e
 */

/**
 * @var {boolean} _accelerometerStarted
 * @private
 */
var _accelerometerStarted = false;
/**
 * @var {onAccelerometerCallback[]} _accelerometerHandlers
 * @private
 */
var _accelerometerHandlers = [];


/** @lends scene */
exports = {

  /**
   * Register a new accelerometer callback
   * @param {onAccelerometerCallback} callback
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
   */
  stopAccelerometer: function() {
    if (_accelerometerStarted) {
      accelerometer.stop();
      _accelerometerStarted = false;
    }
  }

};
