// TODO(vojta): move to separate file
TD.factory('quitApp', function(settings) {
  return function() {
    window.close();
  };
});


TD.controller('App', function($scope, tabs, settings, quitApp) {

  $scope.tabs = tabs;
  $scope.settings = settings;

  $scope.isSettingsVisible = false;
  $scope.isSearchVisible = false;


  $scope.quit = function() {
    settings.store();
    quitApp();
  };


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

  $scope.$on('quit', function() {
    $scope.quit();
  });


  // save / open stuff, currently disabled
  $scope.save = tabs.saveCurrent;
  $scope.open = tabs.open;

  $scope.isSaveDisabled = function() {
    // no tab
    if (!tabs.current) {
      return true;
    }

    // new file
    if (!tabs.current.file) {
      return false;
    }

    return !tabs.current.modified;
  };
});
