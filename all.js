function autoScaleIFrameToParent (frameQuery, parentQuery) {
  function initAutoScale() {
    var screen = document.querySelector(parentQuery);
    if (screen == null) {
      console.error('Element at query "' + parentQuery + '" not found. aborting');
      return;
    }
    var frame = document.querySelector(frameQuery);
    if (frame == null) {
      console.error('Element at query "' + frameQuery + '" not found. aborting');
      return;
    }
    if (frame.dataset['autoScaleTo'] != undefined) {
      console.error('Element at query "' + frameQuery + '" already syncing to element at query "' +
        frame.dataset['autoScaleTo'] + '". aborting');
      return;
    }
    frame.dataset['autoScaleTo'] = parentQuery;
    var iframeNativeWidth = frame.clientWidth;
    var iframeNativeHeight = frame.clientHeight;
    var transformPropNames = ['-webkit-transform', '-moz-transform', '-o-transform', '-ms-transform', 'transform'];
    function updateFrameScale() {
      if (frame.parentNode == null || screen.parentNode == null) {
        window.removeEventListener('resize', updateFrameScale);
        return;
      }
      var scaledWidth = screen.clientWidth / iframeNativeWidth;
      var scaledHeight = screen.clientHeight / iframeNativeHeight;
      var scale = 'scale(' + scaledWidth + ',' + scaledHeight + ')';
      for (var i = transformPropNames.length - 1; i >= 0; i--) {
        frame.style[transformPropNames[i]] = scale;
      }
    }
    window.addEventListener('resize', updateFrameScale);
    updateFrameScale();
  }
  if (document.readyState !== 'complete') {
    window.addEventListener('load', initAutoScale);
  } else {
    initAutoScale();
  }
}
autoScaleIFrameToParent('#game-screen iframe', '#game-screen');

var app = angular.module('scenejs.app', [
  'ngRoute'
]);

app.controller('MainCtrl', [
  '$scope', '$location',  '$rootScope', '$sce', '$route', '$routeParams',
function($scope, $location, $rootScope, $sce, $route, $routeParams) {
  $scope.examples = [
    {
      title: 'Dragon Pong',
      bgImg: 'resources/banner1.png',
      iconImg: 'resources/icon1@2x.png',
      url: 'http://www.weeby.co/flappy-pong/scene-demo/mobile/',
      code: 'http://www.weeby.co/flappy-pong/scene-demo/docs/Application.html',
    },
    {
      title: 'Myth Jump',
      bgImg: 'resources/banner2.png',
      iconImg: 'resources/icon2@2x.png',
      url: 'http://www.weeby.co/mythjump/mobile/',
    },
    {
      title: 'Escape From Rainbow Land',
      bgImg: 'resources/banner3.png',
      iconImg: 'resources/icon3@2x.png',
      url: 'http://www.weeby.co/vertrun/rainbowland/mobile/',
    },
  ];
  $scope.selectedExample = 0;

  $scope.selectExample = function($event, id) {
    $location.path('/example/' + id);
    $location.search('code', null);
  };

  $scope.getUrlAtKeyAsTrusted = function(exampleId, key) {
    if (typeof exampleId === 'number' && exampleId >= 0 && exampleId < $scope.examples.length) {
      return $sce.trustAsResourceUrl($scope.examples[exampleId][key]);
    } else {
      throw new Error('exampleId "' + exampleId + '" not valid');
    }
  };

  // Update the example when the path changes
  $scope.$on('$routeChangeStart', function routeChanging(events, next, current) {
    if (next.params.exampleId !== undefined) {
      $scope.selectedExample = parseInt(next.params.exampleId);
    }
  });

  $scope.$on('$locationChangeSuccess'), function(event, newUrl, oldUrl){
    console.log('$locationChangeSuccess', event, newUrl, oldUrl)
  };

}]);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/example/:exampleId', {
      controller: 'MainCtrl'
    })
    .otherwise({redirectTo: '/example/0'});

  $locationProvider.html5Mode(false);
});
