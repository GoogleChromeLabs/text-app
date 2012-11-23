function MenuController(tabs) {
  this.tabs_ = tabs
  $('#file-menu-new').click(this.newTab_.bind(this));
  $('#file-menu-open').click(this.open_.bind(this));
  $(document).bind('newtab', this.onNewTab.bind(this));
}

MenuController.prototype.newTab_ = function() {
  this.tabs_.newTab();
};

MenuController.prototype.onNewTab = function(e, tab) {
  var id = tab.getID();
  var name = tab.getName();
  var listItem = $('<li><a>' + name + '</a></li>');
  listItem.appendTo($('#tabs-list'));
  listItem.click(this.tabButtonClicked_.bind(this, id));
};

MenuController.prototype.open_ = function() {
  chrome.fileSystem.chooseEntry(
      {'type': 'openWritableFile'},
      this.tabs_.onFileOpen.bind(this.tabs_));
};

MenuController.prototype.tabButtonClicked_ = function(id) {
  this.tabs_.showTab(id);
};
