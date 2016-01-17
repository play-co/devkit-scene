import scene, effects;

// Community art is a helper class for separating game code from art definitions.
// You must register configs using the registerConfig function. The first argument
// is the key for this art asset, and the second argument is the config object.
scene.registerConfig('myArt', {
  type: 'ImageView',
  opts: {
    url: 'http://i.imgur.com/aok0WIJb.jpg'
  }
});

exports = scene(function() {

  // Many scene functions expect a config object as the first parameter.
  // Caling communityart as a function, passing the desired key, will return the art
  // config that was registered earlier.
  var myArtConfig = scene.getConfig('myArt');
  var image = scene.addImage(myArtConfig, 150, 150);

});
