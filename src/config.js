
var DEFAULT_CONFIG = {
  logging: {
    OVERRIDE: false,
    scene: false,
    touchManager: false
  },
  performance: false
};

var USER_CONFIG = CONFIG.modules && CONFIG.modules.scene;

SCENE_CONFIG = merge(USER_CONFIG || {}, DEFAULT_CONFIG);
