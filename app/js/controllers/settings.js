/**
 * @constructor
 */
function SettingsController() {
  $('#open-settings').click(this.open_.bind(this));
  $('#close-settings').click(this.close_.bind(this));
}

SettingsController.prototype.open_ = function() {
  $('#sidebar').addClass('open-settings');
};

SettingsController.prototype.close_ = function() {
  $('#sidebar').removeClass('open-settings');
};

