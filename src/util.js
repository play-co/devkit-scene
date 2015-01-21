// This file contains utility functions that are exposed game-side

/**
 * randRange([low, high], bipolar)
 * randRange(low, high, bipolar = false)
 * ~ low        The minimum value to generate
 * ~ high       The maximum value to generate
 * ~ bipolar    If true, will 1/2 the time negate the generated value
 */
randRange = function(low, high, bipolar) {
  if (typeof(low) === 'object') {
    high = low[1];
    low  = low[0];
  }

  var n = Math.random() * (high - low) + low;
  if (bipolar && Math.random() < .5) n *= -1;
  return n;
}

/**
 * combine(a, b)
 *
 * Merges object b into object a. This is destructive, object a will be changed
 * regardless of the return value. Keys in object b will overwrite those already
 * existing in object a.
 */
combine = function(a, b) {
  for (var k in b) a[k] = b[k];
  return a;
}

