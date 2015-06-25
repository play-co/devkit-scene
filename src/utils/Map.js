exports = Class(function() {

  this.init = function() {
    this.keys = [];
    this.values = [];
  };

  this.put = function(key, value) {
    var index = this.keys.indexOf(key);
    if (index === -1) {
      this.keys.push(key);
      this.values.push(value);
    }
    else {
      this.values[index] = value;
    }
  };

  this.get = function(key) {
    var index = this.keys.indexOf(key);
    return index !== -1
      ? this.values[index]
      : null;
  };

  this.remove = function(key) {
    var index = this.keys.indexOf(key);
    if (index !== -1) {
      var lastKey = this.keys.pop();
      var lastValue = this.values.pop();
      if (index !== this.keys.length) {
        this.keys[index] = lastKey;
        this.values[index] = lastValue;
      }
    }
  };

  this.getKeyAt = function(index) {
    return this.keys[index];
  };

  this.getValueAt = function(index) {
    return this.values[index];
  };

  this.removeAll = function() {
    this.keys.length = 0;
    this.values.length = 0;
  };

  Object.defineProperty(this, "length", {
    get: function() {
      return this.keys.length;
    }
  });

});