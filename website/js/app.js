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
