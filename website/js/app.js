var app = angular.module('scenejs.app', [
  'ngRoute'
]);

app.controller('MainCtrl', [
  '$scope', '$location', '$rootScope',
function($scope, $location, $rootScope) {
  $scope.examples = [
    {
      title: 'Game title 1',
      fgColor: '#378eba',
      bgColor: '#343f4d',
      textColor: '#fff'
    },
    {
      title: 'Game title 2',
      fgColor: '#d7b664',
      bgColor: '#f3f3f3',
      textColor: '#3f3f3f'
    },
    {
      title: 'Game title 3',
      fgColor: '#885c10',
      bgColor: '#f3f3f3',
      textColor: '#3f3f3f'
    },
  ];
  $scope.selectedExample = 0;

  // Update the example when the path changes
  $scope.$on('$routeChangeStart', function routeChanging(events, next, current) {
    debugger
    // if (next.exampleId !== undefined) {
    //   $scope.selectedExample = next.exampleId;
    //   console.log('Exmaple: ', $scope.selectedExample);
    // }
  });

  $scope.$on('$locationChangeSuccess'), function(event, newUrl, oldUrl){
    debugger
  };

}]);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/example/:exampleId', {
    })
    .when('/', {
    })
    .otherwise({redirectTo: '/'});

  $locationProvider.html5Mode(false);
});
