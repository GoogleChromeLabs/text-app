
app.controller('App', function($scope, editor, log, fs, tabs) {

  $scope.files = fs.files;
  $scope.tabs = tabs;

  fs.refresh();

  $scope.openFile = function(file) {
    fs.loadFile(file).then(function(content) {
//      if ($scope.current) {
//        fs.saveFile($scope.current, editor.getContent());
//      }

      // is there already a tab for it ?
      var tab;
      tabs.forEach(function(tab_) {
        if (tab_.file === file) {
          tab = tab_;
        }
      });

      if (!tab) {
        var session = new EditSession(content);
        session.setMode("ace/mode/javascript");
        tab = {file: file, session: session, label: file.name};

        // TODO(vojta): clean this :-D
        session.on('change', function() {
          if (!tab.modified) {
            log(tab.file, 'modified');
            tab.modified = true;
            $scope.$apply();
          }
        });

        tabs.push(tab);
      }

      // select the tab, it will load the session to editor as well
      tabs.select(tab);

      $scope.current = file;

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
      fs.saveFile(tab.file, editor.getContent()).then(function() {
        tab.modified = false;
      });
    } else {
      log('No file to save.');
    }
  };


  // open file using html5 api
  $scope.openFiles = function(files) {
    angular.forEach(files, function(file) {
      log('opening file ' + file.name);
      var reader = new FileReader();

      reader.onload = function(e) {
        log('file loaded ' + file.name);
        editor.setContent(e.target.result);
        $scope.current = file;
        $scope.$digest();
      };

      reader.readAsBinaryString(file);
    });
  };

  $scope.isSaveDisabled = function() {
    if (!tabs.current) return true;
    return !tabs.current.modified;
  };

  $scope.iconFor = function(tab) {
    return tab.modified ? 'icon-edit' : 'icon-remove';
  };
});