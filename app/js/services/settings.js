var Theme = function(name, id) {
  this.name = name;
  this.id = id || 'ace/theme/' + name.toLowerCase().replace(/\s/g, '_');
  this.cls = this.id.replace(/[_\/]/g, '-');
};

var LightTheme = function() {
  Theme.apply(this, arguments);
  this.cls += ' ace-theme-light';
};

var DarkTheme = function() {
  Theme.apply(this, arguments);
  this.cls += ' ace-theme-dark';
};


TD.service('settings', function($rootScope, storage, log, VimHandler, EmacsHandler) {
  var settings = this;

  this.THEMES = [
    new LightTheme('Chrome'),
    new LightTheme('Clouds'),
    new DarkTheme('Clouds Midnight'),
    new DarkTheme('Cobalt'),
    new LightTheme('Crimson Editor'),
    new LightTheme('Dawn'),
    new LightTheme('Dreamweaver'),
    new LightTheme('Eclipse'),
    new DarkTheme('idleFingers', 'ace/theme/idle_fingers'),
    new DarkTheme('krTheme', 'ace/theme/kr_theme'),
    new DarkTheme('Merbivore'),
    new DarkTheme('Merbivore Soft'),
    new DarkTheme('Mono Industrial'),
    new DarkTheme('Monokai'),
    new DarkTheme('Pastel on dark'),
    new DarkTheme('Solarized Dark'),
    new LightTheme('Solarized Light'),
    new LightTheme('TextMate'),
    new DarkTheme('Twilight'),
    new LightTheme('Tomorrow'),
    new DarkTheme('Tomorrow Night'),
    new DarkTheme('Tomorrow Night Blue'),
    new DarkTheme('Tomorrow Night Bright'),
    new DarkTheme('Tomorrow Night 80s', 'ace/theme/tomorrow_night_eighties'),
    new DarkTheme('Vibrant Ink')
  ];

  this.KEY_MODES = [
    {name: 'ACE', id: 'ace', handler: null},
    {name: 'Vim', id: 'vim', handler: VimHandler},
    {name: 'Emacs', id: 'emacs', handler: EmacsHandler}
  ];

  this.SOFT_WRAP = [
    {name: 'None', value: -1},
    {name: 'Window Width', value: 0},
    {name: '80', value: 80},
    {name: '100', value: 100}
  ];

  this.SOFT_TABS = [
    {name: 'Off', value: -1},
    {name: '2', value: 2},
    {name: '4', value: 4},
    {name: '6', value: 6},
    {name: '8', value: 8}
  ];

  var findById = function(collection, id) {
    for (var i = 0; i < collection.length; i++) {
      if (collection[i].id === id) {
        return collection[i];
      }
    }
  };

  var data = {};
  var listeners = {};


  var defineProperty = function(name) {
    settings.__defineGetter__(name, function() {
      return data[name];
    });

    settings.__defineSetter__(name, function(value) {
      data[name] = value;

      if (!listeners[name]) {
        return;
      }

      listeners[name].forEach(function(fn) {
        fn(value);
      });
    });
  };

  defineProperty('theme');
  defineProperty('keyMode');
  defineProperty('softTabs');
  defineProperty('softWrap');

  this.on = function(name, fn) {
    if (!listeners[name]) {
      listeners[name] = [];
    }

    listeners[name].push(fn);
  };

  this.store = function() {
    storage.set({
      settings: {
        theme: data.theme && data.theme.id,
        keyMode: data.keyMode && data.keyMode.id,
        softTabs: data.softTabs,
        softWrap: data.softWrap
      }
    }, function() {
      log('settings saved');
    });
  };

  this.load = function() {
    storage.get(['settings'], function(data) {
      data = data.settings || {};

      if (data.theme) {
        settings.theme = findById(settings.THEMES, data.theme);
        log('loaded theme', settings.theme.id);
      } else {
        settings.theme = findById(settings.THEMES, 'ace/theme/dawn');
        log('default theme', settings.theme.id);
      }

      if (data.keyMode) {
        settings.keyMode = findById(settings.KEY_MODES, data.keyMode);
        log('loaded keyMode', settings.keyMode.id);
      } else {
        settings.keyMode = findById(settings.KEY_MODES, 'ace');
        log('default keyMode', settings.keyMode.id);
      }

      if (angular.isDefined(data.softTabs)) {
        settings.softTabs = data.softTabs;
        log('loaded softTabs', settings.softTabs);
      } else {
        settings.softTabs = 2;
        log('default softTabs', settings.softTabs);
      }

      if (angular.isDefined(data.softWrap)) {
        settings.softWrap = data.softWrap;
        log('loaded softWrap', settings.softWrap);
      } else {
        settings.softWrap = 0;
        log('default softWrap', settings.softWrap);
      }
    });
  };
});
