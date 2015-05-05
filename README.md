Devkit2 Scene Module
====================

The purpose of the scene module is to provide a easy to use layer of abstraction
on top of the devkit2 game engine and other devkit2 modules.

Installation and Usage
----------------------

To install the scene module into your devkit2 project, execute:

    devkit install https://github.com/gameclosure/devkit-scene

Then, to use the scene module change your `Application.js` to fit the following:

    import scene;

    exports = scene(function() {
        // Setup your game here
    });

