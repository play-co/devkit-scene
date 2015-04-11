// This file contains utility functions that are exposed game-side

/**
 * @example randRange([low, high], bipolar)
 * @example randRange(low, high, bipolar)
 * @arg {number} low - The minimum value to generate
 * @arg {number} high - The maximum value to generate
 * @arg {boolean} [bipolar] - If true, then the returned value will be inverted half of the time
 * @returns {number}
 */
randRange = function(low, high, bipolar) {
  if (typeof(low) === 'object') {
    bipolar = high;
    high = low[1];
    low = low[0];
  }

  var n = Math.random() * (high - low) + low;
  if (bipolar && Math.random() < .5) n *= -1;
  return n;
};

/**
 * Merges object b into object a. This is destructive, object a will be changed
 * regardless of the return value. Keys in object b will overwrite those already
 * existing in object a.
 * @arg {object} - The base object
 * @arg {object} - The object whose values will will be overlayed on a
 * @returns {object} The updated {@link a}
 */
combine = function(a, b) {
  for (var k in b) a[k] = b[k];
  return a;
};

/**
  * Choose a random element from {@link array}
  * @arg {array} array
  * @returns {object} A random element from {@link array}
  */
choose = function(array) {};
