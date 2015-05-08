var viewProperties = [
  "x",
  "y",
  "width",
  "height",
  "r",
  "opacity",
  "visible",
  "scale",
  "scaleX",
  "scaleY",
  "flipX",
  "flipY",
  "zIndex",
  "anchorX",
  "anchorY"
];

var PropertyUtil = exports = {

  addViewProperty: function(context, propertyName) {
    Object.defineProperty(context, propertyName, {
      get: function() {
        return this.style[propertyName];
      },
      set: function(value) {
        this.style[propertyName] = value;
      }
    });
  },

  addViewProperties: function(context) {
    for (var i = 0; i < viewProperties.length; i++) {
      PropertyUtil.addViewProperty(context, viewProperties[i]);
    }
  }

};