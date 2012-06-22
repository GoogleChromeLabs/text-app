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

  var applyEvent = function(eventName) {
    $rootScope.$apply(function() {
      $rootScope.$broadcast(eventName);
    });
  };

  document.addEventListener('keydown', function(event) {

    // ESC
    if (event.keyCode === 27) {
      applyEvent('escape');
      return;
    }

    if (!event.metaKey && !event.ctrlKey) return;

    switch (event.keyCode) {
      case KEY.W:
        applyEvent('close');
        break;
      case KEY.N:
        applyEvent('new');
        break;
      case KEY.S:
        applyEvent('save');
        break;
      case KEY.O:
        applyEvent('open');
        break;
      case KEY.F:
        applyEvent('search');
        break;
      case 188: // CMD+,
        applyEvent('settings');
        break;
    }
  });

  var MAX_TAB_SIZE = 200;
  var MIN_TAB_SIZE = 50;
  var countTabSize = function() {
    var countedWidth = (window.innerWidth - 59) / tabs.length;
    return Math.max(Math.min(countedWidth + 23, MAX_TAB_SIZE), MIN_TAB_SIZE);
  };

  $rootScope.tabWidth = MAX_TAB_SIZE

  $rootScope.$watch(function() { return tabs.length; }, function() {
    $rootScope.tabWidth = countTabSize();
  });

  window.addEventListener('resize', function(e) {
    var tabWidth = countTabSize();

    if ($rootScope.tabWidth === tabWidth) {
      return;
    }

    $rootScope.tabWidth = tabWidth;
    $rootScope.$digest();
  });
});
