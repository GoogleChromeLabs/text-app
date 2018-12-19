/**
 * @constructor
 * @param {Settings} settings Settings service.
 */
function SettingsController(settings) {
  this.settings_ = settings;

  if (this.settings_.isReady()) {
    this.showAll_();
  } else {
    $(document).bind('settingsready', this.showAll_.bind(this));
  }

  $(document).bind('settingschange', this.onSettingChange_.bind(this));

  this.bindChanges_();

  $('#open-settings').click(this.open_.bind(this));
  $('#close-settings').click(this.close_.bind(this));
}

SettingsController.prototype.bindChanges_ = function() {
  for (var key in Settings.SETTINGS) {
    switch (Settings.SETTINGS[key].widget) {
      case 'checkbox':
      case 'number':
      case 'select':
        $('#setting-' + key).change(this.onWidgetChange_.bind(this, key));
        break;
    }
  }
};

SettingsController.prototype.open_ = function() {
  $('#sidebar').addClass('open-settings');
};

SettingsController.prototype.close_ = function() {
  $('#sidebar').removeClass('open-settings');
};

SettingsController.prototype.showAll_ = function() {
  var settings = this.settings_.getAll();
  for (var key in settings) {
    this.show_(key, settings[key]);
  }
};

SettingsController.prototype.show_ = function(key, value) {
  switch (Settings.SETTINGS[key].widget) {
    case 'checkbox':
      value ? this.checkSwitch_(key) : this.uncheckSwitch_(key);
      break;
    case 'number':
      $('#setting-' +key).val(parseInt(value));
      break;
    case 'select':
      $('#setting-' +key).val(value);
      break;
  }
};

/**
 * Activates a switch Material Component element in the UI.
 * @param {string} key The unique section of the id of the switch element
 *     (after the 'setting-' prefix).
 */
SettingsController.prototype.checkSwitch_ = function(key) {
  document.getElementById('setting-' + key).setAttribute('checked', '');
  document.getElementById('setting-' + key + '-switch')
      .classList.add('mdc-switch--checked');
}

/**
 * Deactivates a switch Material Component element in the UI.
 * @param {string} key The unique section of the id of the switch element
 *     (after the 'setting-' prefix).
 */
SettingsController.prototype.uncheckSwitch_ = function(key) {
  document.getElementById('setting-' + key).removeAttribute('checked');
  document.getElementById('setting-' + key + '-switch')
      .classList.remove('mdc-switch--checked');
}

SettingsController.prototype.onSettingChange_ = function(e, key, value) {
  this.show_(key, value);
};

SettingsController.prototype.onWidgetChange_ = function(key) {
  var value;
  switch (Settings.SETTINGS[key].widget) {
    case 'checkbox':
      value = $('#setting-' + key).prop('checked');
      break;
    case 'number':
      value = parseInt($('#setting-' + key).val());
      break;
    case 'select':
      value = $('#setting-' + key).val();
      break;
  }

  this.settings_.set(key, value);
};
