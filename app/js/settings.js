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
  this.storage_.get(storageKeys, this.getSettingsCallback_.bind(this));
}

/**
 * @type {string}
 * 'sync' or 'local'.
 */
Settings.AREA = 'sync';

Settings.SETTINGS = {
  'autosave': {'default': false, 'type': 'boolean', 'widget': 'checkbox'},
  'tabsize': {'default': 8, 'type': 'integer', 'widget': 'number'},
  'wraplines': {'default': true, 'type': 'boolean', 'widget': 'checkbox'}
};

/**
 * @param {string} key Setting name.
 * @return {Object}
 */
Settings.prototype.get = function(key) {
  return this.settings_[key];
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
    if (key.indexOf('settings-') !== 0)
      continue;
    var value = changes[key].newValue;
    key = key.substring(9);
    console.log('Settings changed:', key, value);
    this.settings_[key] = value;
    $.event.trigger('settingschange', [key, value]);
  }
};

