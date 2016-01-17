/** User config will merge on top of this for the final `SCENE_CONFIG` */
var DEFAULT_CONFIG = {
  logging: {
    OVERRIDE: false,
    scene: false,
    touchManager: false
  },
  performance: false,
  safeActorOpts: true
};

/**
 * Defined in the games manifest as part of the addons section.
 * See devkit docs for configuring addons.
 */
var USER_CONFIG = CONFIG.modules && CONFIG.modules.scene;

/**
 * Used to configure some of the internal scene modules
 * @global
 */
SCENE_CONFIG = merge(USER_CONFIG || {}, DEFAULT_CONFIG);
