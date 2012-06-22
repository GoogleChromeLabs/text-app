TD.controller('Settings', function($scope, settings) {
  $scope.THEMES = settings.THEMES;
  $scope.KEY_MODES = settings.KEY_MODES;
  $scope.SOFT_WRAP = settings.SOFT_WRAP;
  $scope.SOFT_TABS = settings.SOFT_TABS;

  $scope.settings = settings;
});
