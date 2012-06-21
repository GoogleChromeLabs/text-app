TD.factory('fs', function(log, $window, $q, $rootScope) {

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
      }

      log('FS Error: ', e, msg);

      if (defered) {
        defered.reject(e);
        $rootScope.$digest();
      }
    };
  };

  // get the FileSystem object
  // $window.webkitStorageInfo.requestQuota(PERSISTENT, SIZE, function(grantedBytes) {
  //   $window.webkitRequestFileSystem(PERSISTENT, grantedBytes, function(fs) {
  //     d_fs.resolve(fs);
  //     log('FS loaded, quota', grantedBytes);
  //     $rootScope.$digest();
  //   }, createErrorHandler(d_fs));
  // }, createErrorHandler(d_fs));

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
        // var bb = new WebKitBlobBuilder();
        // bb.append(content);
        // var blob = bb.getBlob(type || 'text/plain');

        var blob = new Blob([content], {type: type || 'text/plain'});
        var error = false;

        writer.onwriteend = function(e) {
          // writer.onwriteend = function(e) {
            if (!error) {
              defered.resolve(true);
              log('File saved ', fileEntry, e);
              $rootScope.$digest();
            }
          // };

          // writer.truncate(blob.size);
        };

        writer.onerror = function(e) {
          error = true;
          defered.reject(e);
          log('File saving failed ', fileEntry, e);
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
