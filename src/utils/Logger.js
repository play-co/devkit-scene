
exports = Class(function() {

  // Set to true to see ALL logger outputs
  this.VERBOSE = SCENE_CONFIG.logging.OVERRIDE;

  this.init = function(name, verbose) {
    this.name = name;
    this.verbose = verbose || this.VERBOSE;
  };

  this.transformArgs = function(args) {
    args = Array.prototype.slice.call(args);
    args.unshift('[' + this.name + ']');
    return args;
  };

  this.log = function() {
    if (this.verbose) {
      console.log.apply(console, this.transformArgs(arguments));
    }
  };

  this.warn = function() {
    console.warn.apply(console, this.transformArgs(arguments));
  };

  this.error = function() {
    console.error.apply(console, this.transformArgs(arguments));
  };

});
