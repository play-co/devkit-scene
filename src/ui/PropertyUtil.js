var viewProperties = [
  'x',
  'y',
  'width',
  'height',
  'r',
  'opacity',
  'visible',
  'scale',
  'scaleX',
  'scaleY',
  'flipX',
  'flipY',
  'zIndex',
  'anchorX',
  'anchorY'
];

/** @class PropertyUtil */
exports = {

  /**
   * Bypasses context.style
   * @memberof PropertyUtil
   * @param  {object}        context      Must have a `style` property
   * @param  {string}        propertyName The property to expose on `context` from `context.style`
   */
  addViewProperty: function(context, propertyName) {
    Object.defineProperty(context, propertyName, {
      enumerable: true,
      get: function() {
        return this.style[propertyName];
      },
      set: function(value) {
        this.style[propertyName] = value;
      }
    });
  },

  /**
   * Add the default viewProperties using {@link PropertyUtil.addViewProperty}
   * @memberof PropertyUtil
   * @param  {object}          context
   */
  addViewProperties: function(context) {
    for (var i = 0; i < viewProperties.length; i++) {
      this.addViewProperty(context, viewProperties[i]);
    }
  }

};
