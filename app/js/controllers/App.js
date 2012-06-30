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

var MAXIMIZE_TITLE = 'Maximize';
var RESTORE_TITLE = 'Restore';

TD.controller('App', function($scope, tabs, settings, appWindow, editor, focus) {

  $scope.tabs = tabs;
  $scope.settings = settings;

  $scope.isSettingsVisible = false;
  $scope.isSearchVisible = false;


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


  $scope.toggleSearch = function(value) {
    $scope.isSearchVisible = angular.isDefined(value) ? value : !$scope.isSearchVisible;

    if ($scope.isSearchVisible) {
      focus('input[ng-model=search]');
    } else {
      $scope.search = '';
      editor.clearFilter();
      editor.focus();
    }
  };


  $scope.doSearch = function() {
    // TODO(vojta): make this nicer, I/O rush :-D
    if (!$scope.search) {
      return;
    }

    if ($scope.search.charAt(0) === ':') {
      var lineNumber = parseInt($scope.search.substr(1), 10);
      if (lineNumber) {
        editor.goToLine(lineNumber);
      }
    } else if ($scope.search.charAt(0) === '/') {
      var filter = $scope.search.substr(1);
      if (filter.length >= 3) {
        // TODO(vojta): delay
        editor.filter(new RegExp(filter, filter.toLowerCase() === filter ? 'i' : ''));
      } else {
        editor.clearFilter();
      }
    } else {
      editor._editor.find($scope.search);
    }
  };

  $scope.searchPrevious = function() {
    if (!$scope.search || $scope.search.charAt(0) === '/' || $scope.search.charAt(0) === ':') {
      return;
    }

    editor._editor.findPrevious();
  };

  $scope.searchNext = function() {
    if (!$scope.search || $scope.search.charAt(0) === '/' || $scope.search.charAt(0) === ':') {
      return;
    }

    editor._editor.findNext();
  };

  $scope.enterSearch = function() {
    // TODO(vojta): make this nicer, I/O rush :-D
    if (!$scope.search) {
      return;
    }

    if ($scope.search.charAt(0) === '/') {
      editor.goToFirstFiltered();
      editor.focus();
    } else if ($scope.search.charAt(0) === ':') {
      $scope.toggleSearch(false);
    } else {
      editor._editor.findNext();
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

  $scope.$on('search', function() {
    $scope.toggleSearch();
  });

  $scope.$on('tab_deselected', function() {
    $scope.toggleSearch(false);
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
