var app = angular.module('TD', []).run(function($window, settings) {
  // load settings from local storage
  settings.load();

  // save settings on page unload
  $window.onunload = function() {
    settings.store();
  };
});
