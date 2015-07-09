/** @lends Logger */
exports = Class(function() {

  // Set to true to see ALL logger outputs
  /** @var {boolean} Logger.VERBOSE */
  this.VERBOSE = SCENE_CONFIG.logging.OVERRIDE;

  /**
   * @constructs
   * @param  {string}  name
   * @param  {boolean} [verbose] Defaults to {@link Logger.VERBOSE}
   */
  this.init = function(name, verbose) {
    /** @type string */
    this.name = name;
    /** @type boolean */
    this.verbose = verbose || this.VERBOSE;
  };

  /**
   * Adds the name as the first argument
   * @param  {array}  args
   * @return {array}  newArgs
   */
  this._transformArgs = function(args) {
    args = Array.prototype.slice.call(args);
    args.unshift('[' + this.name + ']');
    return args;
  };

  /**
   * Replacement for `console.log`.  Will only output if {@link Logger#verbose} is true.
   * @arg args
   */
  this.log = function() {
    if (this.verbose) {
      console.log.apply(console, this._transformArgs(arguments));
    }
  };

  /**
   * Replacement for `console.warn`
   * @arg args
   */
  this.warn = function() {
    console.warn.apply(console, this._transformArgs(arguments));
  };

  /**
   * Replacement for `console.error`
   * @arg args
   */
  this.error = function() {
    console.error.apply(console, this._transformArgs(arguments));
  };

});
