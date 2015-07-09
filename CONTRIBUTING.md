# Contributing to devkit-scene

These are the general guidelines to follow while working on devkit-scene.

### High level organization

Scene is broken up into scene modules.  These modules are logical parts of a game, such as "ui" or "input".  These would be located at `src/ui` and `src/input`.

#### Classes

Some modules add only classes, in which case the classes should follow general devkit structure of a class.

	/** @lends MyClass */
	exports = Class(function() {

		/**
		 * @var {number} MyClass.CLASS_LEVEL_STATIC
		 */
		this.CLASS_LEVEL_STATIC = 1;

		/**
		 * @constructs
		 * @arg {object} opts
		 * @arg {string} opts.someArgString
		 * @arg {number} [opts.someArgOptional]
		 */
		this.init = function(opts) {
			/** @type {string} */
			this.someArg = opts.someArgString;
			/** @type {number} */
			this.someArgOptional = opts.someArgOptional !== undefined ? opts.someArgOptional : 0;

			/** @type {number} */
			this.instanceVariable = 2;
		};

		/** @func */
		this.doSomething = function() { ... }

	});

#### Extended Classes

	/** @lends Logger */
	exports = Class(ExtendedClass, function(supr) {

		/**
		 * @constructs
		 * @arg {object} opts
		 * @extends ExtendedClass
		 */
		this.init = function(opts) {
			supr(this, 'init', [opts]);
		};

	});

### Working on a scene module

Some modules add variables to the global `scene` object.  Some things to note about exposing things on the `scene` object:

- Functions will be bound to the scene object, so `this` will reference the global `scene` object.
- Collisions will be automatically detected
- Objects will be merged if possible
- All modules must be inside of the `SCENE_MODULES` array inside of `src/index.js`

To do this, add a file at `src/module/index.js`:

	/**
	 * Yes, even the private functions get documented
	 */
	var _privateFunction = function() { ... }

	/** @lends scene */
	exports = {

		/**
		 * A cool function
		 */
		someFunction: function() { ... }

	}

### Miscellaneous

- Use single quotes for strings

		"hello" // No
		'hello' // Yes

- Do not use single line shortcuts

		if (something) doThis(); // No
		for (;;) doThis(); // No

		if (something) { // Yes
			doThis();
	 	}
	 	for (;;) { // Yes
	 		doThis();
	 	}