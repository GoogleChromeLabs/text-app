var TD = angular.module('TD.app', []);

TD.log = angular.module('TD.log', []);

// we ask for editor, to get it instantiated before we load settings,
// because editor register listeners
angular.module('TD', ['TD.app']).run(function($window, settings, editor) {
  // load settings from local storage
  settings.load();

  // save settings on page unload
  $window.onunload = function() {
    settings.store();
  };
});
