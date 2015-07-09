import ui.ImageView as ImageView;
import ui.ImageScaleView as ImageScaleView;
import lib.PubSub as PubSub;

var uid = 0;
var uidInput = -1;

exports = Class(ImageScaleView, function(supr) {

  this.init = function(opts) {
    supr(this, 'init', [opts]);

    if (!opts.pressedImage) {
      opts.pressedImage = opts.image;
    }

    if (!opts.disabledImage) {
      opts.disabledImage = opts.image;
    }

    this.normalImage = opts.image;
    this.pressedImage = opts.pressedImage;
    this.disabledImage = opts.disabledImage;

    this.toggle = opts.toggle || false;

    this._btnID = uid++;
    this._pubsub = new PubSub();

    // button up and down callbacks
    if (opts.onDown) {
      this.registerListener('onDown', opts.onDown);
    }
    if (opts.onUp) {
      this.registerListener('onUp', opts.onUp);
    }
    if (opts.onClick) {
      this.registerListener('onClick', opts.onClick);
    }

    // only allow one click
    this.clickOnce = opts.clickOnce || false;
    this.hasBeenClicked = false;

    // pressed state subview offsets, i.e. text subview is lowered to look pressed
    this.pressedOffsetX = opts.pressedOffsetX || 0;
    this.pressedOffsetY = opts.pressedOffsetY || 0;

    // button states
    this.pressed = false;
    this.disabled = false;

    // add an icon subview if included
    opts.icon && this.addIcon(opts.icon);
  };

  /**
   * @arg evtName {string}
   * @arg listener {function|function[]}
   */
  this.registerListener = function(evtName, listener) {
    var registerListener = function(listener) {
      this._pubsub.addListener(evtName, listener);
    }.bind(this);

    if (Array.isArray(listener)) {
      listener.forEach(registerListener);
    } else {
      registerListener(listener);
    }
  };

  this.addIcon = function(icon, width, height) {
    var s = this.style;
    width = width || s.width;
    height = height || s.height;

    if (!this.icon) {
      if (typeof icon === 'string') {
        this.icon = new ImageView({ parent: this, canHandleEvents: false });
      } else {
        this.icon = icon;
        this.addSubview(icon);
      }
    }

    var is = this.icon.style;
    is.x = (s.width - width) / 2; // TODO: always sets this to zero?
    is.y = (s.height - height) / 2; // This as well
    is.width = width;
    is.height = height;

    if (typeof icon === 'string') {
      this.icon.setImage(icon);
    }
  };

  this.setDisabled = function(disabled) {
    this.disabled = disabled;
    this.pressed = false;

    if (disabled) {
      this.setImage(this.disabledImage);
    } else {
      this.setImage(this.normalImage);
    }
  };

  this.setPressed = function(pressed) {
    this.pressed = pressed;
    this.disabled = false;

    if (pressed) {
      this.setImage(this.pressedImage);
      this._pubsub.emit('onDown');
      this.offsetSubviews();
    } else {
      this.setImage(this.normalImage);
      this._pubsub.emit('onUp');
      this.onsetSubviews();
    }
  };

  this.onInputStart = function(evt, srcPt) {
    evt && evt.cancel();

    if (this.disabled) {
      return;
    }

    // save the currently depressed button at the class level
    uidInput = this._btnID;

    if (this.toggle) {
      this.setPressed(!this.pressed);
    } else {
      if (!this.pressed) {
        this.setPressed(true);
      }
    }
  };

  this.onInputSelect = function(evt, srcPt) {
    evt && evt.cancel();

    if ((this.clickOnce && this.hasBeenClicked) || this.disabled) {
      return;
    }

    // wipe our class level button state
    uidInput = -1;

    if (this.toggle) {
      return;
    }

    if (this.pressed) {
      this.setPressed(false);
      this.hasBeenClicked = true;
      this._pubsub.emit('onClick', evt, srcPt);
    }
  };

  this.onInputOut = function() {
    if (this.pressed && uidInput === this._btnID && !this.disabled && !this.toggle) {
      this.setPressed(false);
    }
  };

  this.onInputOver = function() {
    if (!this.pressed && uidInput === this._btnID && !this.disabled && !this.toggle) {
      this.setPressed(true);
    }
  };

  this.offsetSubviews = function() {
    var subviews = this.getSubviews();
    for (var i in subviews) {
      var view = subviews[i];
      if (!view.skipOffset) {
        view.style.x += this.pressedOffsetX;
        view.style.y += this.pressedOffsetY;
      }
    }
  };

  this.onsetSubviews = function() {
    var subviews = this.getSubviews();
    for (var i in subviews) {
      var view = subviews[i];
      if (!view.skipOffset) {
        view.style.x -= this.pressedOffsetX;
        view.style.y -= this.pressedOffsetY;
      }
    }
  };
});