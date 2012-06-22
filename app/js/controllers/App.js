TD.controller('App', function($scope, log, fs, tabs, editor, focus, chromeFs, settings, MODES) {

  $scope.save = tabs.saveCurrent;
  $scope.open = tabs.open;

  $scope.files = fs.files;
  $scope.tabs = tabs;
  $scope.settings = settings;
  $scope.MODES = MODES;

  // fs.refresh();

  $scope.openFile = function(fileEntry) {
    if (!fileEntry) {
      return;
    }

    if (tabs.selectByFile(fileEntry)) {
      return;
    }

    fs.loadFile(fileEntry).then(function(content) {
      tabs.add(fileEntry, content);
    }, function() {
      log('Error during opening file');
    });
  };

  $scope.createNewFile = function() {
    fs.createFile($scope.newFilename).then(function(fileEntry) {
      $scope.openFile(fileEntry);
    });

    $scope.newFilename = '';
  };


  $scope.saveCurrentFile = function() {
    var tab = tabs.current;
    if (tab) {
      fs.saveFile(tab.file, tab.session.getValue()).then(function() {
        tab.modified = false;
      });
    } else {
      log('No file to save.');
    }
  };


  // open file using html5 api
//  $scope.openFiles = function(files) {
//    angular.forEach(files, function(file) {
//      log('opening file ' + file.name);
//      var reader = new FileReader();
//
//      reader.onload = function(e) {
//        log('file loaded ' + file.name);
//        editor.setContent(e.target.result);
//        $scope.current = file;
//        $scope.$digest();
//      };
//
//      reader.readAsBinaryString(file);
//    });
//  };

  $scope.updateMode = function() {
    var tab = tabs.current;
    tab.session.setMode(tab.mode.id);
    tab.manualMode = true;
    editor.focus();
  };

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

  $scope.iconFor = function(tab) {
    return tab.modified ? 'icon-certificate' : 'icon-remove';
  };

  $scope.isSettingsVisible = false;
  $scope.toggleSettings = function() {
    $scope.isSettingsVisible = !$scope.isSettingsVisible;

    if (!$scope.isSettingsVisible) {
      editor.focus();
    }
  };

  $scope.isSearchVisible = false;
  $scope.toggleSearch = function() {
    $scope.isSearchVisible = !$scope.isSearchVisible;

    if ($scope.isSearchVisible) {
      $scope.search = '';
      focus('input[ng-model=search]');
    } else {
      editor.focus();
    }
  };

  $scope.doSearch = function() {
    if ($scope.search.charAt(0) === ':') {
      var lineNumber = parseInt($scope.search.substr(1), 10);
      if (lineNumber) {
        editor.goToLine(lineNumber);
      }
    }
  };

  $scope.$on('escape', function(event) {
    if ($scope.isSearchVisible) {
      $scope.toggleSearch();
    } else if ($scope.isSettingsVisible) {
      $scope.toggleSettings();
    }
  });

  $scope.$on('search', $scope.toggleSearch);
  $scope.$on('settings', $scope.toggleSettings);
});
