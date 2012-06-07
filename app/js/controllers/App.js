TD.controller('App', function($scope, log, fs, tabs, editor, focus) {

  $scope.files = fs.files;
  $scope.tabs = tabs;

  fs.refresh();

  $scope.openFile = function(file) {
    if (tabs.selectByFile(file)) {
      return;
    }

    fs.loadFile(file).then(function(content) {
      tabs.select(tabs.add(file, content));
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

  $scope.isSaveDisabled = function() {
    if (!tabs.current) {
      return true;
    }

    return !tabs.current.modified;
  };

  $scope.iconFor = function(tab) {
    return tab.modified ? 'icon-edit' : 'icon-remove';
  };

  $scope.toggleSettings = function() {
    $scope.isSettingsVisible = !$scope.isSettingsVisible;

    if (!$scope.isSettingsVisible) {
      editor.focus();
    }
  };


  $scope.toggleSearch = function() {
    $scope.isSearchVisible = !$scope.isSearchVisible;

    if ($scope.isSearchVisible) {
      $scope.search = '';
      focus('input[ng-model=search]');
    }
  };

  $scope.hideSearch = function() {
    $scope.isSearchVisible = false;
  };
});
