function MenuController(tabs) {
  this.tabs_ = tabs
  $('#file-menu-new').click(this.newTab_.bind(this));
}

MenuController.prototype.newTab_ = function() {
  var tab = this.tabs_.newTab();
  this.showTabInMenu_(tab);
  this.tabs_.showTab(tab.getID());
};

MenuController.prototype.showTabInMenu_ = function(tab) {
  var id = tab.getID();
  var name = tab.getName();
  var listItem = $('<li><a>' + name + '</a></li>');
  listItem.appendTo($('#tabs-list'));
  listItem.click(this.tabButtonClicked_.bind(this, id));
};

MenuController.prototype.tabButtonClicked_ = function(id) {
  this.tabs_.showTab(id);
};
