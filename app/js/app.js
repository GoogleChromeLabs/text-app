var TD = angular.module('TD.app', []);

TD.log = angular.module('TD.log', []);

// we ask for editor, to get it instantiated before we load settings,
// because editor register listeners
angular.module('TD', ['TD.app', 'TD.log']).run(function($window, settings, editor, tabs, $rootScope) {
  // load settings from local storage
  settings.load();
  tabs.add();

  // save settings on page unload
  // TODO(vojta): store settings, onunload not available on platform apps
  // $window.onunload = function() {
  //   settings.store();
  // };

  var KEY = {};
  // create key map A - Z
  for (var i = 65; i <= 90; i++) {
    KEY[String.fromCharCode(i).toUpperCase()] = i;
  }

  // clipboard - copy, paste, cut
  document.getElementById('editor').addEventListener('keydown', function(event) {
    if (!event.metaKey && !event.ctrlKey) return;

    switch (event.keyCode) {
      case KEY.C:
        document.execCommand('copy');
        break;
      case KEY.V:
        document.execCommand('paste');
        break;
      case KEY.X:
        document.execCommand('cut');
        break;
    }
  });

  document.addEventListener('keydown', function(event) {

    // ESC
    if (event.keyCode === 27) {
      $rootScope.$apply(function() {
        $rootScope.$broadcast('escape');
      });

      return;
    }

    if (!event.metaKey && !event.ctrlKey) return;

    switch (event.keyCode) {
      case KEY.W:
        $rootScope.$apply(function() {
          tabs.close();
        });
        break;
      case KEY.N:
        $rootScope.$apply(function() {
          tabs.add();
        });
        break;
      case KEY.S:
        $rootScope.$apply(function() {
          tabs.saveCurrent();
        });
        break;
      case KEY.O:
        $rootScope.$apply(function() {
          tabs.open();
        });
        break;
      case KEY.F:
        $rootScope.$apply(function() {
          $rootScope.$broadcast('search');
        });
        break;
    }
  });
});
