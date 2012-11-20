/**
 * @constructor
 */
function TextDrive() {
  this.tabs_ = null;
  this.windowController_ = null;
}

TextDrive.prototype.init = function() {
  this.tabs_ = new Tabs();
  this.windowController_ = new WindowController(this.tabs_);
};

var textDrive = new TextDrive();

$(document).ready(textDrive.init.bind(textDrive));

function oldInit() {
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

  var applyEvent = function(eventName, event) {
    event.preventDefault();

    $rootScope.$apply(function() {
      $rootScope.$broadcast(eventName);
    });
  };

  document.addEventListener('keydown', function(event) {

    // ESC
    if (event.keyCode === 27) {
      applyEvent('escape', event);
      return;
    }

    if (!event.metaKey && !event.ctrlKey) {
      return;
    }

    switch (event.keyCode) {
      case KEY.W:
        return applyEvent('close', event);
      case KEY.N:
        return applyEvent('new', event);
      case KEY.S:
        return applyEvent('save', event);
      case KEY.O:
        return applyEvent('open', event);
      case KEY.F:
        return applyEvent('search', event);
      case KEY.Q:
        return applyEvent('quit', event);
      case 188: // CMD+,
        return applyEvent('settings', event);
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
}
