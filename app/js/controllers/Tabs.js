TD.controller('Tabs', function($scope, tabs, settings, appWindow) {

  $scope.tabs = tabs;


  $scope.quit = function() {
    settings.store();
    appWindow.close();
  };


  var isMaximized = false;
  $scope.maximizeTitle = MAXIMIZE_TITLE;

  $scope.maximize = function() {
    if (isMaximized) {
      appWindow.restore();
      isMaximized = false;
      $scope.maximizeTitle = MAXIMIZE_TITLE;
    } else {
      appWindow.maximize();
      isMaximized = true
      $scope.maximizeTitle = RESTORE_TITLE;
    }
  };


  $scope.$on('quit', function() {
    $scope.quit();
  });

  $scope.$on('close', function() {
    tabs.close();
  });

  $scope.$on('new', function() {
    tabs.add();
  });

  $scope.$on('save', function() {
    tabs.saveCurrent();
  });

  $scope.$on('open', function() {
    tabs.open();
  });
});
