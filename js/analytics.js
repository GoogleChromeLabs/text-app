/**
 * @constructor
 */
function Analytics() {
  this.service_ = null;
<<<<<<< Updated upstream
=======
  this.tracker_ = null;
>>>>>>> Stashed changes
  this.hasReportedSettings_ = false;

  this.init_();
}

Analytics.prototype.init_ = function() {
  this.service_ = analytics.getService('text_app');
  var propertyId = 'UA-48886257-2';
  if (chrome.runtime.id === 'mmfbcljfglbokpmkimbfghdkjmjhdgbg') {
    propertyId = 'UA-48886257-1';
  }
  this.tracker_ = this.service_.getTracker(propertyId);
<<<<<<< Updated upstream
};

Analytics.prototype.reportSettings = function(settings) {
  if (this.hasReportedSettings_)
    return; // Settings should be reported only once per session.

  this.tracker_.set('dimension1', settings.get('spacestab').toString());
  this.tracker_.set('dimension2', settings.get('tabsize').toString());
  this.tracker_.set('dimension3',
                    Math.round(settings.get('fontsize')).toString());
  this.tracker_.set('dimension4', settings.get('sidebaropen').toString());
  this.tracker_.set('dimension5', settings.get('theme'));

  this.tracker_.sendAppView('main');
  this.hasReportedSettings_ = true;
};

Analytics.prototype.reportError = function(message, error) {
  this.tracker_.sendEvent('error', message, error);
=======
};

Analytics.prototype.isEnabled_ = function(callback) {
  chrome.storage.sync.get('service-analytics', function(results) {
    if (results['service-analytics'] === true)
      callback();
  });
};

Analytics.prototype.reportSettings = function(settings) {
  this.isEnabled_(function() {
    if (this.hasReportedSettings_)
      return; // Settings should be reported only once per session.

    this.tracker_.set('dimension1', settings.get('spacestab').toString());
    this.tracker_.set('dimension2', settings.get('tabsize').toString());
    this.tracker_.set('dimension3',
                      Math.round(settings.get('fontsize')).toString());
    this.tracker_.set('dimension4', settings.get('sidebaropen').toString());
    this.tracker_.set('dimension5', settings.get('theme'));

    this.tracker_.sendAppView('main', function() {
      this.hasReportedSettings_ = true;
    }.bind(this));
  }.bind(this));
};

Analytics.prototype.reportError = function(message, error) {
  this.isEnabled_(function() {
    this.tracker_.sendEvent('error', message, error);
  }.bind(this));
};

Analytics.prototype.setEnabled = function(enabled, callback) {
  chrome.storage.sync.set({'service-analytics': enabled}, callback);
>>>>>>> Stashed changes
};
