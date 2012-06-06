app.controller('Settings', function($scope, settings) {
  $scope.THEMES = settings.THEMES;
  $scope.KEY_MODES = settings.KEY_MODES;
  $scope.SOFT_WRAP = settings.SOFT_WRAP;

  $scope.settings = settings;
});