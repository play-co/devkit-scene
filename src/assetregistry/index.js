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

exports = function(key, type) {
  return exports.getConfig(key, type);
};

exports.getConfig = function(key, type) {
  if (typeof key === 'string') {
    var res = exports.getResource(key, type);
    if (res) {
      return JSON.parse(JSON.stringify(res.config || res.opts));
    }
    return null;
  }
  return key;
};

/**
  * Easy to use, easy to abuse. Pass either a key, or an object. Strings will be
  * looked up using `communityart(key)`, other types of keys will just be returned.
  * @function communityart.getResource
  * @arg {String|Object} key
  * @arg {String}        [type]
  * @returns {Object}    opts
  */
exports.getResource = function(key, type) {
  // nope
  if (typeof key !== 'string') {
    throw new Error('can only look up string keys');
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
};

/**
  * @function communityart.registerConfig
  * @arg {string} key
  * @arg {CaInfo|CaInfo[]} config
  */
exports.registerConfig = function(key, config) {
  console.log('assetregistry: registering config for', key);
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
};