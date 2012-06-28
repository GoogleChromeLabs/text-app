var TD = angular.module('TD.app', []);

TD.log = angular.module('TD.log', []);

// we ask for editor, to get it instantiated before we load settings,
// because editor register listeners
angular.module('TD', ['TD.app', 'TD.log']).run(function($window, settings, editor, tabs, $rootScope, log) {

  // load settings from local storage
  settings.load();
  tabs.add();


  var KEY = {};
  // create key map A - Z
  for (var i = 65; i <= 90; i++) {
    KEY[String.fromCharCode(i).toUpperCase()] = i;
  }

  // clipboard - copy, paste, cut
  document.getElementById('editor').addEventListener('keydown', function(event) {

    if (!event.metaKey && !event.ctrlKey) {
      return;
    }

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

    if (!event.metaKey && !event.ctrlKey) {
      return;
    }

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
      case KEY.Q:
        $rootScope.$broadcast('quit');
        break;
      case 188: // CMD+,
        applyEvent('settings');
        break;
    }
  });

  var MAX_TAB_SIZE = 200;
  var MIN_TAB_SIZE = 50;
  var countTabSize = function() {
    var countedWidth = (window.innerWidth - 140) / tabs.length;
    return Math.max(Math.min(countedWidth + 23, MAX_TAB_SIZE), MIN_TAB_SIZE);
  };

  $rootScope.tabWidth = MAX_TAB_SIZE;

  $rootScope.$watch(function() { return tabs.length; }, function() {
    $rootScope.tabWidth = countTabSize();
    log('tab width', $rootScope.tabWidth);
  });

  var timer;
  window.addEventListener('resize', function(e) {
    if (timer) {
      return;
    }

    timer = setTimeout(function() {
      var tabWidth = countTabSize();

      if ($rootScope.tabWidth !== tabWidth) {
        $rootScope.tabWidth = tabWidth;
        $rootScope.$digest();
      }
      timer = null;
    }, 50);
  });
});
