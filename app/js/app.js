// we ask for editor, to get it instantiated before we load settings,
// because editor register listeners
var app = angular.module('TD', []).run(function($window, settings, editor) {
  // load settings from local storage
  settings.load();

  // save settings on page unload
  $window.onunload = function() {
    settings.store();
  };
});
