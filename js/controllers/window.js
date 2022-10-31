/**
 * @constructor
 */
function WindowController(editor, settings, tabs) {
  this.editor_ = editor;
  this.settings_ = settings;
  this.tabs_ = tabs;
  document.getElementById('window-close').addEventListener('click', () => {
    this.close();
  });
  $('#window-minimize').click(this.minimize_.bind(this));
  $('#window-maximize').click(this.maximize_.bind(this));
  $('#toggle-sidebar').click(this.toggleSidebar_.bind(this));
  $('#sidebar-resizer').mousedown(this.resizeStart_.bind(this));
  $(window).bind('error', this.onError_.bind(this));
  $(document).bind('filesystemerror', this.onFileSystemError.bind(this));
  $(document).bind('loadingfile', this.onLoadingFile.bind(this));
  $(document).bind('switchtab', this.onChangeTab_.bind(this));
  $(document).bind('tabchange', this.onTabChange_.bind(this));
  $(document).bind('tabpathchange', this.onTabPathChange.bind(this));
  $(document).bind('tabrenamed', this.onChangeTab_.bind(this));
  $(document).bind('tabsave', this.onTabChange_.bind(this));

  this.initUI_();
}

/**
 * Update the editor.
 */
WindowController.prototype.updateEditor = function(editor) {
  this.editor_ = editor;
};

/**
 * Performs all the required initialization for the UI.
 * @private
 */
WindowController.prototype.initUI_ = function() {
  for (const element of document.querySelectorAll('.mdc-icon-button')) {
    const ripple = mdc.ripple.MDCRipple.attachTo(element);
    ripple.unbounded = true;
    // Required due to issue
    // https://github.com/material-components/material-components-web/issues/3984
    new ResizeObserver(() => {
      ripple.layout();
    }).observe(element);
  }
  for (const element of document.querySelectorAll('.mdc-switch')) {
    new mdc.switchControl.MDCSwitch(element);
  }
  for (const element of document.querySelectorAll('.mdc-radio')) {
    const formField = new mdc.formField.MDCFormField(element.parentElement);
    formField.input = new mdc.radio.MDCRadio(element);
  }
  if (this.settings_.isReady()) {
    this.initSidebar_();
  } else {
    $(document).bind('settingsready', this.initSidebar_.bind(this));
  }
};

WindowController.prototype.initSidebar_ = function() {
  // FIXME: move this to CSS where possible (init code)
  if (this.settings_.get('sidebaropen')) {
    $('#sidebar').css('width', this.settings_.get('sidebarwidth') + 'px');
    $('#sidebar').css('border-right-width', '2px');
    $('#toggle-sidebar')
        .attr('title', chrome.i18n.getMessage('closeSidebarButton'));
  } else {
    $('#sidebar').css('width', '0');
    $('#sidebar').css('border-right-width', '0');
    $('#toggle-sidebar')
        .attr('title', chrome.i18n.getMessage('openSidebarButton'));
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

/**
 * Close app window after warning user of all unsaved progress if present.
 */
WindowController.prototype.close = function() {
  this.tabs_.promptAllUnsaved(window.close);
};

WindowController.prototype.focus_ = function() {
  window.chrome.app.window.current().focus();
};

WindowController.prototype.minimize_ = function() {
  window.chrome.app.window.current().minimize();
};

WindowController.prototype.maximize_ = function() {
  var maximized = window.chrome.app.window.current().isMaximized();

  if (maximized) {
    window.chrome.app.window.current().restore();
    $('#window-maximize')
        .attr('title', chrome.i18n.getMessage('maximizeButton'));
  } else {
    window.chrome.app.window.current().maximize();
    $('#window-maximize')
        .attr('title', chrome.i18n.getMessage('restoreButton'));
  }
};

WindowController.prototype.setAlwaysOnTop = function(isAlwaysOnTop) {
  window.chrome.app.window.current().setAlwaysOnTop(isAlwaysOnTop);
};

/** Opens the sidebar if it is closed. */
WindowController.prototype.openSidebar = function() {
  if (this.settings_.get('sidebaropen')) return;
  this.settings_.set('sidebaropen', true);
    $('#sidebar').css('width', this.settings_.get('sidebarwidth') + 'px');
    $('#sidebar').css('border-right-width', '2px');
    $('#toggle-sidebar')
        .attr('title', chrome.i18n.getMessage('closeSidebarButton'));
};

WindowController.prototype.toggleSidebar_ = function() {
  // FIXME: Move this to css where possible (toggle code)
  if (this.settings_.get('sidebaropen')) {
    this.settings_.set('sidebaropen', false);
    $('#sidebar').css('width', '0');
    $('#sidebar').css('border-right-width', '0');
    $('#toggle-sidebar')
        .attr('title', chrome.i18n.getMessage('openSidebarButton'));
  } else {
    this.openSidebar();
  }
  this.editor_.focus();
};

WindowController.prototype.onLoadingFile = function(e) {
  $('#title-filename').text(chrome.i18n.getMessage('loadingTitle'));
};

WindowController.prototype.onFileSystemError = function(e) {
  $('#title-filename').text(chrome.i18n.getMessage('errorTitle'));
};

WindowController.prototype.onChangeTab_ = function(e, tab) {
  $('#title-filename').text(tab.getName());
  this.onTabChange_();
};

WindowController.prototype.onTabPathChange = function(e, tab) {
  $('#title-filename').attr('title', tab.getPath());
};

WindowController.prototype.onTabChange_ = function(e, tab) {
  if (this.tabs_.getCurrentTab().isSaved()) {
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
  if (sidebarWidth < 20) sidebarWidth = 20;
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

WindowController.prototype.onError_ = function(event) {
  var message = event.originalEvent.message;
  var errorStack = event.originalEvent.error.stack;
};
