// TODO(vojta): move to separate file
TD.value('appWindow', {
  close: function() {
    window.close();
  },
  maximize: function() {
    window.chrome.appWindow.maximize();
  },
  restore: function() {
    window.chrome.appWindow.restore();
  }
});


TD.controller('App', function($scope, tabs, settings, appWindow) {

  $scope.tabs = tabs;
  $scope.settings = settings;

  $scope.isSettingsVisible = false;
  $scope.isSearchVisible = false;


  $scope.quit = function() {
    settings.store();
    appWindow.close();
  };

  var isMaximized = false;
  $scope.maximize = function() {
    if (isMaximized) {
      isMaximized = false;
      appWindow.restore();
    } else {
      isMaximized = true
      appWindow.maximize();
    }
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
