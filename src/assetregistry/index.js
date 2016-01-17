var _resources = {};

var getTypeFromResource = function(type, resource) {
  if (Array.isArray(resource)) {
    for (var i = 0; i < resource.length; ++i) {
      var res = getTypeFromResource(type, resource[i]);
      if (res) {
        return res;
      }
    }
    return null;
  }

  // Verify the resource type matches
  if (resource.type === type) {
    return resource;
  }
  return null;
};

/** @lends scene */
exports = {

  /**
   * Get a duplicate of a registered config. Non-string keys will be returned.
   * @param   {String}  key
   * @param   {String}  type
   * @returns {Object|null}
   */
  getConfig: function(key, type) {
    if (typeof key !== 'string') {
      return key;
    }
    var res = exports.getResource(key, type);
    if (!res) {
      return null;
    }
    return JSON.parse(JSON.stringify(res.config || res.opts));
  },

  /**
   * Easy to use, easy to abuse. Pass either a key, or an object. Non-string keys will just be returned.
   * @param {String|Object} key
   * @param {String}        [type]
   * @returns {Object}    opts
   */
  getResource: function(key, type) {
    // nope
    if (typeof key !== 'string') {
      throw new Error('can only look up string keys');
    }

    // Determine if the key is a key or a local url
    if (key.indexOf('resources/') === 0) {
      // If it is a local url, return a default opts object
      return {
        url: key
      };
    }

    // If it is a key, return either the specified type, or the defualt if no type was specified
    var resObj;
    if (key in _resources) {
      resObj = _resources[key];
    } else {
      // TODO: cache a default object in _resources
      resObj = {
        type: 'ImageView',
        config: {
          url: key + '.png'
        }
      };
    }

    // Check for a requested type
    var requestedTypeResource;
    if (type) {
      requestedTypeResource = getTypeFromResource(type, resObj);
    }
    // either the type is not defined, or we could not find that type
    if (!type || !requestedTypeResource) {
      if (Array.isArray(resObj)) {
        requestedTypeResource = resObj[0];
      } else {
        requestedTypeResource = resObj;
      }
    }

    return requestedTypeResource;
  },

  /**
   * @typedef {function} CaHandlerFunction
   * @arg {string} key
   * @arg {CaInfo} info
   * @arg {Object} opts
   * @returns {View} newView
   */

  /**
   * @typedef {Object} CaInfo
   * @property {string} type - The type of handler that this opts expects
   * @property {Object} opts - Opts to be passed to the creation handler
   */

  /**
   * @param {string} key
   * @param {CaInfo|CaInfo[]} config
   */
  registerConfig: function(key, config) {
    console.log('assetRegistry: registering config for', key);
    if (key in _resources) {
      // already exists, add to the existing key
      if (Array.isArray(config)) {
        _resources[key] = _resources[key].concat(config);
      } else {
        _resources[key].push(config);
      }
    } else {
      // doesn't already exist, just set
      if (!Array.isArray(config)) {
        config = [config];
      }
      _resources[key] = config;
    }
  }

};
