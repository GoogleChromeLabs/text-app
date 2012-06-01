var app = angular.module('TD', []);

var EditSession = ace.require("ace/edit_session").EditSession;
var BlobBuilder = window.WebKitBlobBuilder;

app.factory('editor', function() {
  var editor = ace.edit('editor');

  editor.setTheme("ace/theme/monokai");
  editor.setSession(new EditSession(''));
  editor.getSession().setMode("ace/mode/javascript");

  return {
    focus: function() {
      setTimeout(function() {
        editor.focus();
      }, 0);
    },

    getContent: function() {
      return editor.getSession().getDocument().getValue();
    },

    setContent: function(content) {
      editor.setSession(new EditSession(content));
      editor.getSession().setMode("ace/mode/javascript");
    }
  };
});

//chrome.experimental.identity.getAuthToken(function(token) {
//  console.log('token', token);
//});

// gdocs
var DOCS_SCOPE_URL = 'https://docs.google.com/feeds/';
var DOCS_FEED_URL = DOCS_SCOPE_URL + 'default/private/full/';

var Doc = function(entry) {
  this.title = entry.title.$t;
  this.size = entry.docs$size ? entry.docs$size.$t : null;
  this.updated = new Date(entry.updated.$t.split('T')[0]);
  this.entry = entry;

  //      doc.icon = gdocs.getLink(entry.link,
  //          'http://schemas.google.com/docs/2007#icon').href;
  //      doc.alternateLink = gdocs.getLink(entry.link, 'alternate').href;
};




var initFs = function(fs) {
  console.log('FS', fs);
};

var errorFs = function(e) {
  var msg = '';



  log('Error: ' + msg);
};



app.factory('fs', function(log, $window, $q, $rootScope) {

  var SIZE = 1024 * 1024 * 10; // 10MB
  var d_fs = $q.defer();
  var p_fs = d_fs.promise; // FileSystem


  var createErrorHandler = function(defered) {
    return function(e) {
      var msg = '';

      switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
          msg = 'QUOTA_EXCEEDED_ERR';
          break;
        case FileError.NOT_FOUND_ERR:
          msg = 'NOT_FOUND_ERR';
          break;
        case FileError.SECURITY_ERR:
          msg = 'SECURITY_ERR';
          break;
        case FileError.INVALID_MODIFICATION_ERR:
          msg = 'INVALID_MODIFICATION_ERR';
          break;
        case FileError.INVALID_STATE_ERR:
          msg = 'INVALID_STATE_ERR';
          break;
        default:
          msg = 'Unknown Error';
          break;
      };

      log('FS Error: ', e, msg);

      if (defered) {
        defered.reject(e);
        $rootScope.$digest();
      }
    };
  };

  // get the FileSystem object
  $window.webkitStorageInfo.requestQuota(PERSISTENT, SIZE, function(grantedBytes) {
    $window.webkitRequestFileSystem(PERSISTENT, grantedBytes, function(fs) {
      d_fs.resolve(fs);
      log('FS loaded, quota', grantedBytes);
      $rootScope.$digest();
    }, errorFs);
  }, createErrorHandler());

  return {
    files: [],


    refresh: function() {
      var defered = $q.defer();
      var self = this;

      p_fs.then(function(fs) {
        var reader = fs.root.createReader();
        reader.readEntries(function(results) {
          // TODO(vojta): recycle previous FileEntry objects
          self.files.length = 0;
          Array.prototype.slice.call(results).forEach(function(item) {
            self.files.push(item);
          });

          defered.resolve(self.files);
          log('Loaded ' + self.files.length + ' files.');
          $rootScope.$digest();
        }, createErrorHandler(defered));
      }, createErrorHandler(defered));

      return defered.promise;
    },


    createFile: function(name, opt_content) {
      log('Creating file', name);

      var self = this;
      var defered = $q.defer();

      p_fs.then(function(fs) {
        fs.root.getFile(name, {create: true, exclusive: true}, function(file) {
          self.files.push(file);
          defered.resolve(file);
          log('File created', name);
          $rootScope.$digest();
        }, createErrorHandler(defered));
      }, createErrorHandler(defered));

      return defered.promise;
    },


    saveFile: function(fileEntry, content, type) {
      var defered = $q.defer();

      fileEntry.createWriter(function(writer) {
        var bb = new BlobBuilder();
        bb.append(content);

        var blob = bb.getBlob(type || 'text/plain');

        writer.onwriteend = function(e) {
          writer.onwriteend = function(e) {
            defered.resolve();
            log('File saved ', fileEntry);
            $rootScope.$digest();
          };

          writer.truncate(blob.size);
        };

        writer.onerror = function(e) {
          defered.reject(e);
          log('File saving failed ', fileEntry);
          $rootScope.$digest();
        };

        writer.write(blob);
      }, createErrorHandler(defered));

      return defered.promise;
    },


    loadFile: function(fileEntry) {
      var defered = $q.defer();
      log('Loading file', fileEntry);

      fileEntry.file(function(file) {
        var fr = new FileReader();

        fr.onload = function(e) {
          defered.resolve(this.result);
          log('File loaded', fileEntry);
          $rootScope.$digest();
        };
        fr.readAsText(file);
      }, createErrorHandler(defered));

      return defered.promise;
    }
  };
});


app.controller('App', function($scope, $http, editor, log, fs) {

  $scope.files = fs.files;

//  fs.createFile('test.js');
  fs.refresh();

  $scope.openFile = function(file) {
    fs.loadFile(file).then(function(content) {
      if ($scope.current) {
        fs.saveFile($scope.current, editor.getContent());
      }

      $scope.current = file;
      editor.setContent(content);
      editor.focus();
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
    if ($scope.current) {
      fs.saveFile($scope.current, editor.getContent());
    } else {
      log('No file to save.');
    }
  };


  // open file using html5 api
  $scope.openFiles = function(files) {
    console.log('files')
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
});


app.filter('size', function() {
  return function(size) {
    return size === null ? '' : '(' + size + 'bytes)';
  };
});


app.filter('toClass', function() {
  return function(log) {
    return angular.lowercase(log).replace(/[\:\,]/g, '').replace(/\[.*\]/, '');
  };
});



app.directive('openFiles', function($exceptionHandler) {
  return {
    compile: function(tplElm, tplAttr) {
      tplElm.after('<input type="file" multiple style="display: none;">');

      return function(scope, elm, attr) {
        var input = angular.element(elm[0].nextSibling);

        // evaluate the expression when file changed (user selects a file)
        input.bind('change', function() {
          try {
            scope.$eval(attr.openFiles, {$files: input[0].files});
          } catch(e) {
            $exceptionHandler(e);
          }
        });

        // trigger file dialog when the button clicked
        elm.bind('click', function() {
          input[0].click();
        });
      };
    }
  };
});

app.directive('visibleIf', function() {
  return function(scope, elm, attr) {
    scope.$watch(attr.visibleIf, function(visible) {
      elm.css('visibility', visible ? 'visible' : 'hidden');
    });
  };
});


app.directive('onEnter', function() {
  return function(scope, elm, attr) {
    elm.bind('keypress', function(event) {
      if (event.charCode === 13) {
        scope.$apply(attr.onEnter);
      }
    });
  };
});


// log into console
// add log entry into $rootScope
// $digest() if not already in progress
app.provider('log', function() {
  var scope, window;

  this.$get = function($rootScope, $window) {
    scope = $rootScope;
    window = $window;

    scope.logs = [];
    scope.logs.clear = function() {
      this.length = 0;
    };

    return this.log;
  };

  this.log = function() {
    var args = Array.prototype.slice.call(arguments).map(function(arg) {
        return arg.name || arg;
//        return arg instanceof FileEntry ? arg.name : arg;
    });

    scope.logs.unshift(args.join(' '));
    window.console.log.apply(window.console, arguments);

//    if (!scope.$$phase) {
//      scope.$digest();
//    }
  };
});


// I know, it's brutal :-D
app.config(function($provide, logProvider) {
  $provide.decorator('$rootScope', function($delegate) {
    var original = $delegate.__proto__.$digest;

    $delegate.__proto__.$digest = function() {
//      if (!$delegate.$$phase) $delegate.$$phase = 'beforeDigest';
      logProvider.log('DIGEST', this.$id);
//      if ($delegate.$$phase == 'beforeDigest') $delegate.$$phase = null;

      return original.apply(this, arguments);
    };

    return $delegate;
  });
});


app.controller('Tabs', function($scope) {
  $scope.tabs = [{label: 'first.html'}, {label: 'another.js'}, {label: 'last.js'}];

  $scope.select = function(tab) {
    $scope.current = tab;
  };

  $scope.add = function() {
    $scope.tabs.push({label: 'new'});
  };
});
