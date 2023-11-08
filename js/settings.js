/**
 * @constructor
 */
function Settings() {
  this.ready_ = false;
  this.settings_ = {};
  var storageKeys = {};
  for (var key in Settings.SETTINGS) {
    this.settings_[key] = Settings.SETTINGS[key]['default'];
    storageKeys['settings-' + key] = this.settings_[key];
  }
  // Can be changed to chrome.storage.local.
  this.storage_ = chrome.storage[Settings.AREA];
  chrome.storage.onChanged.addListener(this.onChanged_.bind(this));
  chrome.runtime.onInstalled.addListener(this.removeOldSettings_.bind(this));
  this.storage_.get(storageKeys, this.getSettingsCallback_.bind(this));

  /** The media query list to detect if the preferred color scheme is dark. */
  this.colorSchemeMatcherDark_ =
      window.matchMedia('(prefers-color-scheme: dark)');
  this.colorSchemeMatcherDark_.addEventListener('change', () => {
    if (this.settings_['theme'] === 'default') {
      $.event.trigger('settingschange', ['theme', this.get('theme')]);
    }
  });
}

/**
 * @type {string}
 * 'sync' or 'local'.
 */
Settings.AREA = 'sync';

/**
 * @type {Object.<string, Object>}
 */
Settings.SETTINGS = {
  'alwaysontop': {'default': false, 'type': 'boolean', 'widget': 'checkbox'},
  'fontsize': {'default': 14, 'type': 'number', 'widget': 'number'},
  'linenumbers': {'default': true, 'type': 'boolean', 'widget': 'checkbox'},
  'sidebaropen': {'default': false, 'type': 'boolean', 'widget': null},
  'sidebarwidth': {'default': 220, 'type': 'integer', 'widget': null},
  'smartindent': {'default': true, 'type': 'boolean', 'widget': 'checkbox'},
  'spacestab': {'default': true, 'type': 'boolean', 'widget': 'checkbox'},
  'tabsize': {'default': 4, 'type': 'integer', 'widget': 'number'},
  'theme': {'default': 'default', 'type': 'string', 'widget': 'radio'},
  'wraplines': {'default': true, 'type': 'boolean', 'widget': 'checkbox'},
  'search': {'default': true, 'type': 'boolean', 'widget': 'search'},
};

Settings.prototype.removeOldSettings_ = function() {
  if ('autosave' in this.settings_) delete this.settings_['autosave'];
  this.storage_.remove('autosave');
};

/**
 * @param {string} key Setting name.
 * @return {Object}
 */
Settings.prototype.get = function(key) {
  const setting = this.settings_[key];

  if (key === 'theme' && setting === 'default') {
    return this.colorSchemeMatcherDark_.matches ? 'dark' : 'light';
  }

  return setting;
};

Settings.prototype.getAll = function() {
  return this.settings_;
};

Settings.prototype.set = function(key, value) {
  var item = {};
  item['settings-' + key] = value;
  this.storage_.set(item);
  // this.settings_ will be updated in onChanged_ to keep them in sync with
  // storage.
};

Settings.prototype.reset = function(key) {
  var defaultValue = Settings.SETTINGS[key]['default'];
  this.set(key, defaultValue);
};

Settings.prototype.isReady = function() {
  return this.ready_;
};

Settings.prototype.getSettingsCallback_ = function(settings) {
  this.ready_ = true;
  for (var key in settings) {
    var value = settings[key];
    key = key.substring(9);
    this.settings_[key] = value;
  }
  $.event.trigger('settingsready');
};

Settings.prototype.onChanged_ = function(changes, areaName) {
  if (areaName !== Settings.AREA) {
    console.warn('Storage change in wrong area. Maybe a bug?');
    return;
  }

  for (var key in changes) {
    if (key.indexOf('settings-') !== 0) continue;
    var value = changes[key].newValue;
    key = key.substring(9);
    console.log('Settings changed:', key, value);
    this.settings_[key] = value;
    $.event.trigger('settingschange', [key, value]);
  }
};
