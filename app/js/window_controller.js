/**
 * @constructor
 */
function WindowController() {
  this.maximized_ = false;
  $('#window-close').click(this.close_.bind(this));
  $('#window-maximize').click(this.maximize_.bind(this));
  $('#toggle-sidebar').click(this.toggleSidebar_.bind(this));
  $(document).bind('switchtab', this.onChangeTab_.bind(this));
  $(document).bind('tabrenamed', this.onChangeTab_.bind(this));
}

WindowController.prototype.close_ = function() {
  window.close();
};

WindowController.prototype.maximize_ = function() {
  if (this.maximized_) {
    window.chrome.app.window.current().restore();
    this.maximized_ = false;
  } else {
    window.chrome.app.window.current().maximize();
    this.maximized_ = true;
  }
};

WindowController.prototype.toggleSidebar_ = function() {
  $('#sidebar').toggleClass('open');
};

WindowController.prototype.onChangeTab_ = function(e, tab) {
  $('#title-filename').text(tab.getName());
};
