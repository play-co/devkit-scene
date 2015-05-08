// This file contains utility functions that are exposed game-side

/**
  * Choose a random number between a and b.
  * @example randRange([a, b], bipolar)
  * @example randRange(a, b, bipolar)
  * @arg {number} a
  * @arg {number} b
  * @arg {boolean} [bipolar] - If true, then the returned value will be inverted half of the time
  * @returns {number}
  */
randRange = function(a, b, bipolar) {
  if (typeof(a) === 'object') {
    bipolar = b;
    b = a[1];
    a = a[0];
  }

  var low, high;
  if (a < b) {
    low = a;
    high = b;
  } else {
    low = b;
    high = a;
  }

  var n = Math.random() * (high - low) + low;
  if (bipolar && Math.random() < 0.5) {
    n *= -1;
  }
  return n;
};

/**
  * Choose a random int between a and b
  * @arg {number} a
  * @arg {number} [b=0]
  * @arg {boolean} [bipolar]
  * @returns {int}
  */
randRangeI = function(a, b, bipolar) {
  b = b || 0;
  return Math.floor(randRange(a, b, bipolar));
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
  * Choose a random element from {@link array}. Checks for undefined and array length of 0.
  * @arg {array} array
  * @returns {object} randomElement A random element from the array
  */
choose = function(array) {
  if (!array || !array.length) return;

  return array[Math.floor(Math.random() * array.length)];
};

/**
  * Randomize the elements in an {@link array}.
  * @arg {array} Array
  * @returns {array} The shuffled Array
  */
shuffle = function(array) {
  var currentIndex = array.length;
  var temporaryValue;
  var randomIndex;

  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

/**
  * Choose a random element using the key array returned from Object.keys
  * @arg {Object} object
  * @returns {Object} objectProperty A random element from the object
  */
pickRandomProperty = function(obj) {
  var result = choose(Object.keys(obj));
  return obj[result];
};
