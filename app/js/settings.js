/**
 * @constructor
 */
function Settings() {
  this.ready_ = false;
  this.settings_ = {};
  var storageKeys = {};
  for (var key in Settings.SETTINGS) {
    this.settings_[key] = Settings.SETTINGS[key].default;
    storageKeys['settings-' + key] = this.settings_[key];
  }
  chrome.storage.onChanged.addListener(this.onChanged_.bind(this));
  chrome.storage.local.get(storageKeys,
                           this.getSettingsCallback_.bind(this));
}

Settings.SETTINGS = {
  'autosave': {'default': false, 'type': 'boolean','widget': 'checkbox'}
};

Settings.prototype.get = function(key) {
  return this.settings_[key];
};

Settings.prototype.getAll = function() {
  return this.settings_;
};

Settings.prototype.set = function(key, value) {
  var item = {};
  item['settings-' + key] = value;
  chrome.storage.local.set(item);
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
  if (areaName !== 'local')
    return;

  for (var key in changes) {
    if (key.indexOf('settings-') !== 0)
      continue;
    var value = changes[key].newValue;
    key = key.substring(9);
    this.settings_[key] = value;
    $.event.trigger('settingschange', [key, value]);
  }
};

