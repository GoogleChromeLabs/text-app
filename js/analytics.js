/**
 * @constructor
 */
function Analytics(enabled) {
  this.hasReportedSettings_ = false;
  this.setEnabled(enabled);

  var service = analytics.getService('text_app');
  var propertyId = 'UA-48886257-2';
  if (chrome.runtime.id === 'mmfbcljfglbokpmkimbfghdkjmjhdgbg') {
    propertyId = 'UA-48886257-1';
  }
  this.tracker_ = service.getTracker(propertyId);
};

Analytics.prototype.reportSettings = function(settings) {
  if (!this.enabled_ || this.hasReportedSettings_)
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
};

Analytics.prototype.reportError = function(message, error) {
  if (this.enabled_)
    this.tracker_.sendEvent('error', message, error);
};

Analytics.prototype.setEnabled = function(enabled) {
  this.enabled_ = enabled;
};
