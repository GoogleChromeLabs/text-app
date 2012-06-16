var TD = angular.module('TD.app', []);

TD.log = angular.module('TD.log', []);

// we ask for editor, to get it instantiated before we load settings,
// because editor register listeners
angular.module('TD', ['TD.app', 'TD.log']).run(function($window, settings, editor) {
  // load settings from local storage
  settings.load();

  // save settings on page unload
  // TODO(vojta): store settings, onunload not available on platform apps
  // $window.onunload = function() {
  //   settings.store();
  // };

  // clipboard - copy, paste, cut
  angular.element(document.getElementById('editor')).bind('keydown', function(event) {
    if (!event.metaKey && !event.ctrlKey) return;

    if (event.keyCode === 67) {
      document.execCommand('copy');
    } else if (event.keyCode === 86) {
      document.execCommand('paste');
    } else if (event.keyCode === 88) {
      document.execCommand('cut');
    }
  });
});
