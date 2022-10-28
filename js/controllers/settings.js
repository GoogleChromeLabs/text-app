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

  this.addInputListeners_();

  $('#open-settings').click(this.openSettings_.bind(this));
  $('#close-settings').click(this.closeSettings.bind(this));
}

/**
 * Adds event listeners to settings inputs.
 * @private
 */
SettingsController.prototype.addInputListeners_ = function() {
  for (const key in Settings.SETTINGS) {
    switch (Settings.SETTINGS[key].widget) {
      case 'checkbox':
      case 'number':
        $('#setting-' + key).change(this.saveSetting_.bind(this, key));
        break;
      case 'radio':
        for (const element of
            document.querySelectorAll('input[name=setting-' + key + ']')) {
          element.addEventListener('input', () => this.saveSetting_(key));
        }
        break;
    }
  }
};

SettingsController.prototype.openSettings_ = function() {
  $('#sidebar').addClass('open-settings');
  // Focus the first setting.
  $('#settings-list input:first').focus();
};

/** Close the settings page if it was open. */
SettingsController.prototype.closeSettings = function() {
  $('#sidebar').removeClass('open-settings');
  // Focus the button that reopens settings.
  $('#open-settings').focus();
};

SettingsController.prototype.showAll_ = function() {
  var settings = this.settings_.getAll();
  for (var key in settings) {
    this.show_(key, settings[key]);
  }
};

/**
 * Displays a new setting value in the UI.
 * @param {string} key The unique section of the id of the switch element
 *     (after the 'setting-' prefix).
 * @param {string} value The value to set the setting to.
 * @private
 */
SettingsController.prototype.show_ = function(key, value) {
  switch (Settings.SETTINGS[key].widget) {
    case 'checkbox':
      this.setSwitch_(key, value);
      break;
    case 'number':
      $('#setting-' +key).val(parseInt(value));
      break;
    case 'radio':
      document.getElementById('setting-' + key + '-' + value)
          .setAttribute('checked', '');
  }
};

/**
 * Sets a switch Material Component element in the UI to active/inactive.
 * @param {string} key The unique section of the id of the switch element
 *     (after the 'setting-' prefix).
 * @param {boolean} value If true, activates the switch; if false, deactivates
 *     the switch
 * @private
 */
SettingsController.prototype.setSwitch_ = function(key, value) {
  document.getElementById('setting-' + key).toggleAttribute('checked', value);
  document.getElementById('setting-' + key + '-switch').classList
      .toggle('mdc-switch--checked', value);
}

SettingsController.prototype.onSettingChange_ = function(e, key, value) {
  this.show_(key, value);
};

/**
 * Saves the value of a setting UI widget.
 * @param {string} key The unique section of the id of the setting element
 *     (after the 'setting-' prefix).
 * @private
 */
SettingsController.prototype.saveSetting_ = function(key) {
  var value;
  switch (Settings.SETTINGS[key].widget) {
    case 'checkbox':
      value = $('#setting-' + key).prop('checked');
      break;
    case 'number':
      value = parseInt($('#setting-' + key).val());
      break;
    case 'radio':
      value = document.querySelector('input[name=setting-' + key + ']:checked')
          .getAttribute('value');
      break;
  }

  this.settings_.set(key, value);
};

