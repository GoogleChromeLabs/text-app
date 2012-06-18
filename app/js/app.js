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

  // clipboard - copy, paste, cut
  document.getElementById('editor').addEventListener('keydown', function(event) {
    if (!event.metaKey && !event.ctrlKey) return;

    switch (event.keyCode) {
      case 67: // C
        document.execCommand('copy');
        break;
      case 86: // V
        document.execCommand('paste');
        break;
      case 88: // X
        document.execCommand('cut');
        break;
    }
  });

  document.addEventListener('keydown', function(event) {
    if (!event.metaKey && !event.ctrlKey) return;

    switch (event.keyCode) {
      case 87: // W
        $rootScope.$apply(function() {
          tabs.close();
        });
        break;
      case 78: // N
        $rootScope.$apply(function() {
          tabs.add();
        });
        break;
      case 83: // S
        $rootScope.$apply(function() {
          tabs.saveCurrent();
        });
        break;
      case 79: // O
        $rootScope.$apply(function() {
          tabs.open();
        });
        break;
      // default:
        // console.log(event.keyCode);
    }
  });
});
