TD.controller('StatusBar', function($scope, editor, tabs, MODES) {

  $scope.tabs = tabs;
  $scope.MODES = MODES;


  $scope.updateMode = function() {
    var tab = tabs.current;

    tab.session.setMode(tab.mode.id);
    tab.manualMode = true;
    editor.focus();
  };


  $scope.toggleSettings = function(value) {
    $scope.$parent.isSettingsVisible = angular.isDefined(value) ? value : !$scope.isSettingsVisible;

    if (!$scope.isSettingsVisible) {
      editor.focus();
    }
  };


  $scope.$on('escape', function(event) {
    if ($scope.isSearchVisible) {
      $scope.toggleSearch(false);
    } else if ($scope.isSettingsVisible) {
      $scope.toggleSettings(false);
    }
  });


  $scope.$on('settings', function() {
    $scope.toggleSettings();
  });
});
