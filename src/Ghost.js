import entities.Entity as Entity;

exports = Class(Entity, function() {
  var supr = Entity.prototype;

  this.viewClass = null;

  /**
   * new Ghost(x, y, w, h, opts) - to make a collidable box
   * new Ghost(x, y, r, opts)    - to make a collidable circle
   */
  this.init = function(x, y, w, h, opts) {
    if (opts === undefined && typeof(h) !== 'number') {
      opts = h || {};
      opts.isCircle = true;
      opts.hitBounds = { x: x, y: y, r: w };
    } else {
      opts = opts || {};
      opts.hitBounds = { x: x, y: y, w: w, h: h };
    }

    if (opts.isAnchored === undefined) opts.isAnchored = true;
    
    supr.init.call(this, opts);
    this.opts = opts;
  }
  
  this.reset = function() {
    supr.reset.call(this, 0, 0, this.opts);
  }
})
