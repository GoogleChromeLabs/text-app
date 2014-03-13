/**
 * @constructor
 */
function Analytics() {
  this.enabled_ = false;
  this.service_ = null;
}

Analytics.prototype.start = function() {
  if (this.enabled_ || this.service_) {
    throw 'Analytics should be started only once per session.';
  }

  this.enabled_ = true;
  this.service_ = analytics.getService('text_app');
  this.tracker_ = this.service_.getTracker('UA-48886257-1');
  this.tracker_.sendAppView('main');
};

Analytics.prototype.disable = function() {
  this.enabled_ = false;
};
