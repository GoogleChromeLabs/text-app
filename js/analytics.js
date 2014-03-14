/**
 * @constructor
 */
function Analytics() {
  this.service_ = null;
}

Analytics.prototype.start = function(settings) {
  if (this.service_) {
    throw 'Analytics should be started only once per session.';
  }

  this.service_ = analytics.getService('text_app');
  var propertyId = 'UA-48886257-2';
  if (chrome.runtime.id === 'mmfbcljfglbokpmkimbfghdkjmjhdgbg') {
    propertyId = 'UA-48886257-1';
  }
  this.tracker_ = this.service_.getTracker(propertyId);

  this.reportSettings_(settings);

  this.tracker_.sendAppView('main');
};

Analytics.prototype.reportSettings_ = function(settings) {
  this.tracker_.set('dimension1', settings.get('spacestab').toString());
  this.tracker_.set('dimension2', settings.get('tabsize').toString());
  this.tracker_.set('dimension3',
                    Math.round(settings.get('fontsize')).toString());
  this.tracker_.set('dimension4', settings.get('sidebaropen').toString());
  this.tracker_.set('dimension5', settings.get('theme'));
};
