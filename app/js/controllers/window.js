/**
 * @constructor
 */
function WindowController() {
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
  var maximized = window.outerHeight == window.screen.availHeight &&
                  window.outerWidth == window.screen.availWidth;

  if (maximized) {
    window.chrome.app.window.current().restore();
  } else {
    window.chrome.app.window.current().maximize();
  }
};

WindowController.prototype.toggleSidebar_ = function() {
  $('#sidebar').toggleClass('open');
  setTimeout(function() {$.event.trigger('resize');}, 200);
};

WindowController.prototype.onChangeTab_ = function(e, tab) {
  $('#title-filename').text(tab.getName());
};
