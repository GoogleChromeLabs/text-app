TD.service('settings', function($rootScope, storage, log, THEMES, KEY_MODES, SOFT_WRAP, SOFT_TABS) {
  var settings = this;

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
        settings.theme = findById(THEMES, data.theme);
        log('loaded theme', settings.theme.id);
      } else {
        settings.theme = findById(THEMES, 'ace/theme/dawn');
        log('default theme', settings.theme.id);
      }

      if (data.keyMode) {
        settings.keyMode = findById(KEY_MODES, data.keyMode);
        log('loaded keyMode', settings.keyMode.id);
      } else {
        settings.keyMode = findById(KEY_MODES, 'ace');
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
