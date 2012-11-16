TD.controller('Header', function($scope, settings, appWindow) {
  $scope.title = 'Untitled 1';

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

  $scope.toggleSidebar = function() {
    $scope.$parent.isSidebarVisible = !$scope.isSidebarVisible;
  };

  $scope.$on('quit', function() {
    $scope.quit();
  });

  $scope.$on('close', function() {
    tabs.close();
  });
});
