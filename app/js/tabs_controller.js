function MenuController(tabs) {
  this.tabs_ = tabs
  $('#file-menu-new').click(this.newTab_.bind(this));
}

MenuController.prototype.newTab_ = function() {
  this.tabs_
};
