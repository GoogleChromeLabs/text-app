function WindowController(tabs) {
  this.tabs_ = tabs;
  this.maximized_ = false;
  $('#window-close').click(this.close.bind(this));
  $('#window-maximize').click(this.maximize.bind(this));
  $('#toggle-sidebar').click(this.toggleSidebar.bind(this));
  ace.edit('editor');
}

WindowController.prototype.close = function() {
  window.close();
};

WindowController.prototype.maximize = function() {
  if (this.maximized_) {
    window.chrome.app.window.current().restore();
    this.maximized_ = false;
  } else {
    window.chrome.app.window.current().maximize();
    this.maximized_ = true;
  }
};

WindowController.prototype.toggleSidebar = function() {
  $('#sidebar').toggleClass('open');
};
