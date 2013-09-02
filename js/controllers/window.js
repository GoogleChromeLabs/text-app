/**
 * @constructor
 */
function WindowController(editor, settings) {
  this.editor_ = editor;
  this.settings_ = settings;
  this.currentTab_ = null;
  $('#window-close').click(this.close_.bind(this));
  $('#window-maximize').click(this.maximize_.bind(this));
  $('#toggle-sidebar').click(this.toggleSidebar_.bind(this));
  $('#sidebar-resizer').mousedown(this.resizeStart_.bind(this));
  $(document).bind('switchtab', this.onChangeTab_.bind(this));
  $(document).bind('tabrenamed', this.onChangeTab_.bind(this));
  $(document).bind('tabchange', this.onTabChange_.bind(this));
  $(document).bind('tabsave', this.onTabChange_.bind(this));

  if (this.settings_.isReady()) {
    this.initSidebar_();
  } else {
    $(document).bind('settingsready', this.initSidebar_.bind(this));
  }
}

WindowController.prototype.initSidebar_ = function() {
  if (this.settings_.get('sidebaropen')) {
    $('#sidebar').css('width', this.settings_.get('sidebarwidth') + 'px');
    $('#toggle-sidebar').attr('title', 'Close sidebar');
  } else {
    $('#sidebar').css('width', '0');
    $('#toggle-sidebar').attr('title', 'Open sidebar');
  }
};

WindowController.prototype.windowControlsVisible = function(show) {
  if (show) {
    $('header').removeClass('hide-controls');
  } else {
    $('header').addClass('hide-controls');
  }
};

/**
 * @param {string} theme
 */
WindowController.prototype.setTheme = function(theme) {
  $('body').attr('theme', theme);
};

WindowController.prototype.close_ = function() {
  window.close();
};

WindowController.prototype.maximize_ = function() {
  var maximized = window.outerHeight == window.screen.availHeight &&
                  window.outerWidth == window.screen.availWidth;

  if (maximized) {
    window.chrome.app.window.current().restore();
    $('#window-maximize').attr('title', 'Maximize');
  } else {
    window.chrome.app.window.current().maximize();
    $('#window-maximize').attr('title', 'Restore');
  }
};

WindowController.prototype.toggleSidebar_ = function() {
  if (this.settings_.get('sidebaropen')) {
    this.settings_.set('sidebaropen', false);
    $('#sidebar').css('width', '0');
    $('#toggle-sidebar').attr('title', 'Open sidebar');
  } else {
    this.settings_.set('sidebaropen', true);
    $('#sidebar').css('width', this.settings_.get('sidebarwidth') + 'px');
    $('#toggle-sidebar').attr('title', 'Close sidebar');
  }
  this.editor_.focus();
  setTimeout(function() {$.event.trigger('resize');}, 200);
};

WindowController.prototype.onChangeTab_ = function(e, tab) {
  this.currentTab_ = tab;
  $('#title-filename').text(tab.getName());
  this.onTabChange_();
};

WindowController.prototype.onTabChange_ = function(e, tab) {
  if (this.currentTab_.isSaved()) {
    $('#title-filename').removeClass('unsaved');
  } else {
    $('#title-filename').addClass('unsaved');
  }
};

WindowController.prototype.resizeStart_ = function(e) {
  this.resizeMouseStartX_ = e.clientX;
  this.resizeStartWidth_ = parseInt($('#sidebar').css('width'), 10);
  $(document).on('mousemove.sidebar', this.resizeOnMouseMove_.bind(this));
  $(document).on('mouseup.sidebar', this.resizeFinish_.bind(this));
  $(document).css('cursor', 'e-resize !important');
  $('#sidebar').css('-webkit-transition', 'none');
};

WindowController.prototype.resizeOnMouseMove_ = function(e) {
  var change = e.clientX - this.resizeMouseStartX_;
  var sidebarWidth = this.resizeStartWidth_ + change;
  if (sidebarWidth < 20)
    sidebarWidth = 20;
  $('#sidebar').css('width', sidebarWidth + 'px');
  return sidebarWidth;
};

WindowController.prototype.resizeFinish_ = function(e) {
  var sidebarWidth = this.resizeOnMouseMove_(e);
  this.settings_.set('sidebarwidth', sidebarWidth);
  $(document).off('mousemove.sidebar');
  $(document).off('mouseup.sidebar');
  $(document).css('cursor', 'default');
  $('#sidebar').css('-webkit-transition', 'width 0.2s ease-in-out');
};
