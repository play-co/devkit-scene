# Devkit2 Scene Module

The purpose of the scene module is to provide a easy to use layer of abstraction
on top of the devkit2 game engine and other devkit2 modules.

## Installation and Usage

To install the scene module into your devkit2 project, execute:

    devkit install https://github.com/gameclosure/devkit-scene

Then, to use the scene module change your `Application.js` to fit the following:

    import scene;

    exports = scene(function() {
        // Setup your game here
    });

----------------------

## Contributing

Scene is a system for making 2d mobile game development (on devkit) as easy and painless as possible.

The code is organized into modules, which can export variables directly to the `scene` namespace.  All modules are contained in the `SCENE_MODULES` variable, so any new modules will need to go there.

If you are having trouble making a new module accessible, try setting the `VERBOSE = true`.
