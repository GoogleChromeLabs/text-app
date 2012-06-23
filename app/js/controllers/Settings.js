TD.controller('Settings', function($scope, settings, THEMES, KEY_MODES, SOFT_TABS, SOFT_WRAP) {
  $scope.settings = settings;

  $scope.THEMES = THEMES;
  $scope.KEY_MODES = KEY_MODES;
  $scope.SOFT_TABS = SOFT_TABS;
  $scope.SOFT_WRAP = SOFT_WRAP;
});
