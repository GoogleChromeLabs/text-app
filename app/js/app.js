var app = angular.module('TD', []);

var EditSession = ace.require("ace/edit_session").EditSession;
var BlobBuilder = window.WebKitBlobBuilder;

app.factory('editor', function() {
  var editor = ace.edit('editor');
//  var INIT_CONTENT = "function reverseString(str) {\n" +
//                     "  return str.split('').reverse().join('');\n" +
//                     "}\n";
//
//  editor.setSession(new EditSession(INIT_CONTENT));
  editor.setTheme("ace/theme/twilight");
  editor.getSession().setMode("ace/mode/javascript");

  return editor;
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

app.controller('App', function($scope, $http, editor) {
  // hack to by pass broken auth
  $scope.accessToken = 'ya29.AHES6ZTJ-vxMoLJb7LhO_WjZlRE1RRgluqCrn7IjCFbS4rg';

  $scope.docs = [];
  $scope.logs = [];

  var log = function(msg) {
    console.log(msg);
    $scope.logs.push(msg);
  };


  // open file using html5 api
  $scope.openFile = function(files) {
    angular.forEach(files, function(file) {
      log('opening file ' + file.name);
      var reader = new FileReader();

      reader.onload = function(e) {
        log('file loaded ' + file.name);
        editor.setSession(new EditSession(e.target.result));
        editor.getSession().setMode("ace/mode/javascript");

        $scope.current = file;
        $scope.$apply();
      };

      reader.readAsBinaryString(file);
    });
  };

  $scope.saveFile = function() {
    var bb = new BlobBuilder();
    bb.append('SOMETHING');

    var b = bb.getBlob();

    var w = b.createWriter();
//
//    var fw = new FileWriter();
//
//    fw.onwrite = function() {
//      log('write succcess');
//    };
//
//    fw.onerror = function() {
//      log('write error');
//    };
//
//    fw.write(bb.getBlob());
  };

});


app.filter('size', function() {
  return function(size) {
    return size === null ? '' : '(' + size + 'bytes)';
  };
});



app.directive('openFile', function($exceptionHandler) {
  return {
    compile: function(tplElm, tplAttr) {
      tplElm.after('<input type="file" style="display: none;">');

      return function(scope, elm, attr) {
        var input = angular.element(elm[0].nextSibling);

        // evaluate the expression when file changed (user selects a file)
        input.bind('change', function() {
          try {
            scope.$eval(attr.openFile, {$files: input[0].files});
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