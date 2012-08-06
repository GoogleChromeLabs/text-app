TD.factory('fs', function($q, $rootScope, log) {

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

  return {

    saveFile: function(fileEntry, content, type) {
      var defered = $q.defer();

      fileEntry.createWriter(function(writer) {
        var blob = new Blob([content], {type: type || 'text/plain'});
        var error = false;

        writer.onwriteend = function(e) {
          writer.onwriteend = function(e) {
            if (!error) {
              defered.resolve(true);
              log('File saved ', fileEntry, e);
              $rootScope.$digest();
            }
          };

          writer.truncate(blob.size);
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
