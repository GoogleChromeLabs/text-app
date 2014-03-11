/**
 * @constructor
 */
function Analytics() {
  this.enabled_ = false;
}

Analytics.prototype.enable = function() {
  this.enabled_ = true;
};

Analytics.prototype.disable = function() {
  this.enabled_ = false;
};
