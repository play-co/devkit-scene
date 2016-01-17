/** This file contains utility functions that are exposed game-side */

/**
  * Choose a random number between a and b.
  * @example randRange([a, b], bipolar)
  * @example randRange(a, b, bipolar)
  * @global
  * @arg     {number}  a
  * @arg     {number}  b
  * @arg     {boolean} [bipolar=false] Should the returned value will be inverted half of the time
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
 * Basic 2D distance
 * @global
 * @arg    {number} x
 * @arg    {number} y
 * @arg    {number} x2
 * @arg    {number} y2
 * @return {number}
 */
dist = function(x, y, x2, y2) {
  var dx = x - x2;
  var dy = y - y2;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
  * Choose a random int between a and b
  * @global
  * @arg     {number}  a
  * @arg     {number}  [b=0]
  * @arg     {boolean} [bipolar=false] Should the returned value will be inverted half of the time
  * @returns {number}
  */
randRangeI = function(a, b, bipolar) {
  b = b || 0;
  return Math.floor(randRange(a, b, bipolar));
};

/**
 * Merges object b into object a. This is destructive, object a will be changed
 * regardless of the return value. Keys in object b will overwrite those already
 * existing in object a.
 * @global
 * @arg     {object} The base object
 * @arg     {object} The object whose values will will be overlayed on a
 * @returns {object} The updated {@link a}
 */
combine = function(a, b) {
  for (var k in b) a[k] = b[k];
  return a;
};

/**
  * Choose a random element from the array. Checks for undefined and array length of 0.
  * @global
  * @arg     {array}  array
  * @returns {object} randomElement A random element from the array
  */
choose = function(array) {
  if (!array || !array.length) return;

  return array[Math.floor(Math.random() * array.length)];
};

/**
  * Randomize the elements in the array.
  * @global
  * @arg     {array} array
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
  * @global
  * @arg     {object} object
  * @returns {object} objectProperty A random element from the object
  */
pickRandomProperty = function(obj) {
  var result = choose(Object.keys(obj));
  return obj[result];
};

/**
 * @see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments
 * @global
 * @param  argumentsObject
 * @return {Array}
 */
argumentsToArray = function(argumentsObject) {
  var args = new Array(argumentsObject.length);
  for(var i = 0, j = args.length; i < j; ++i) {
    // i is always valid index in the arguments object
    args[i] = argumentsObject[i];
  }
  return args;
};

deepClone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

DEG_TO_RAD = Math.PI / 180;
RAD_TO_DEG = 180 / Math.PI;
