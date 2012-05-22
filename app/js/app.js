var app = angular.module('TD', []);

app.factory('editor', function() {
  var editor = ace.edit('editor');
  var EditSession = ace.require("ace/edit_session").EditSession;
  var INIT_CONTENT = "function reverseString(str) {\n" +
                     "  return str.split('').reverse().join('');\n" +
                     "}\n";

  editor.setSession(new EditSession(INIT_CONTENT));
  editor.setTheme("ace/theme/twilight");
  editor.getSession().setMode("ace/mode/javascript");

  return editor;
});


app.run(function(editor) {
  editor.focus();
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

app.controller('App', function($scope, $http) {
  // hack to by pass broken auth
  $scope.accessToken = 'ya29.AHES6ZTqD4K7yl0gfF1qqMOwkxGQ70x9KlBBjpTyVq6VBBW6rI8zIA';

  $scope.docs = [];



  $scope.open = function(doc) {
    console.log(doc.entry)
    $scope.current = doc;
    $http.get("https://www.googleapis.com/drive/v1/files/0Al_wTC8Lhi1PdHl1VnFydFFPTzJTWGJQbVM5U0FEaEE", {headers: {
      'Authorization': 'Bearer ' + $scope.accessToken,
      'GData-Version': '3.0'
    }}).success(function(d) {
      console.log(d);
    })
  };



  // load the docs
  var config = {
      params: {'alt': 'json'},
      headers: {
          'Authorization': 'Bearer ' + $scope.accessToken,
          'GData-Version': '3.0'
      }
  };

  var successCallback = function(data) {
    data.feed.entry.forEach(function(entry) {
      $scope.docs.push(new Doc(entry));
    });
    console.log(data.feed.entry[0]);
  };

  $http.get(DOCS_FEED_URL, config).success(successCallback).error(function() {
    // testing as web app - the API won't talk to localhost, so we use dump
    successCallback(DUMP);
  });
});


app.filter('size', function() {
  return function(size) {
    return size === null ? '' : '(' + size + 'bytes)';
  };
});