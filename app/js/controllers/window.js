/**
 * @constructor
 */
function WindowController() {
  this.currentTab_ = null;
  $('#window-close').click(this.close_.bind(this));
  $('#window-maximize').click(this.maximize_.bind(this));
  $('#toggle-sidebar').click(this.toggleSidebar_.bind(this));
  $(document).bind('switchtab', this.onChangeTab_.bind(this));
  $(document).bind('tabrenamed', this.onChangeTab_.bind(this));
  $(document).bind('tabchange', this.onTabChange_.bind(this));
  $(document).bind('tabsave', this.onTabChange_.bind(this));
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
  $('body').toggleClass('sidebar-open');
  $('#editor textarea').focus();
  if ($('body').hasClass('sidebar-open')) {
    $('#toggle-sidebar').attr('title', 'Close sidebar');
  } else {
    $('#toggle-sidebar').attr('title', 'Open sidebar');
  }
  setTimeout(function() {$.event.trigger('resize');}, 200);
};

WindowController.prototype.onChangeTab_ = function(e, tab) {
  this.currentTab_ = tab;
  $('#title-filename').text(tab.getName());
};

WindowController.prototype.onTabChange_ = function(e, tab) {
  if (this.currentTab_.isSaved()) {
    $('#title-filename').removeClass('unsaved');
  } else {
    $('#title-filename').addClass('unsaved');
  }
};
