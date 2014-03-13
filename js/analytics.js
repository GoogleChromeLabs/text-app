/**
 * @constructor
 */
function Analytics() {
  this.enabled_ = false;
  this.service_ = null;
}

Analytics.prototype.start = function(settings) {
  if (this.enabled_ || this.service_) {
    throw 'Analytics should be started only once per session.';
  }

  this.enabled_ = true;
  this.service_ = analytics.getService('text_app');
  this.tracker_ = this.service_.getTracker('UA-48886257-1');

  this.reportSettings_(settings);

  this.tracker_.sendAppView('main');
};

Analytics.prototype.disable = function() {
  this.enabled_ = false;
};

Analytics.prototype.reportSettings_ = function(settings) {
  this.tracker_.set('dimension1', settings.get('spacestab').toString());
  this.tracker_.set('dimension2', settings.get('tabsize').toString());
  this.tracker_.set('dimension3',
                    Math.round(settings.get('fontsize')).toString());
  this.tracker_.set('dimension4', settings.get('sidebaropen').toString());
  this.tracker_.set('dimension5', settings.get('theme'));
};
