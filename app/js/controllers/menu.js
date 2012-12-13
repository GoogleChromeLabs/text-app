/**
 * @constructor
 */
function MenuController(tabs) {
  this.tabs_ = tabs
  $('#file-menu-new').click(this.newTab_.bind(this));
  $('#file-menu-open').click(this.open_.bind(this));
  $('#file-menu-save').click(this.save_.bind(this));
  $('#file-menu-saveas').click(this.saveas_.bind(this));
  $(document).bind('newtab', this.onNewTab.bind(this));
  $(document).bind('tabchange', this.onTabChange.bind(this));
  $(document).bind('tabclosed', this.onTabClosed.bind(this));
  $(document).bind('tabrenamed', this.onTabRenamed.bind(this));
  $(document).bind('tabsave', this.onTabSave.bind(this));
  $(document).bind('switchtab', this.onSwitchTab.bind(this));
}

MenuController.prototype.onNewTab = function(e, tab) {
  var id = tab.getId();
  var name = tab.getName();
  var listItem = $('<li id="tab' + id + '">' +
                   '<div class="filename">' + name + '</div>' +
                   '<div class="close"></div></li>');
  listItem.appendTo($('#tabs-list'));
  listItem.click(this.tabButtonClicked_.bind(this, id));
  listItem.find('.close').click(this.closeTabClicked_.bind(this, id));
};

MenuController.prototype.onTabRenamed = function(e, tab) {
  $('#tab' + tab.getId() + ' .filename').text(tab.getName());
};

MenuController.prototype.onTabChange = function(e, tab) {
  $('#tab' + tab.getId()).addClass('unsaved');
};

MenuController.prototype.onTabClosed = function(e, tab) {
  $('#tab' + tab.getId()).remove();
};

MenuController.prototype.onTabSave = function(e, tab) {
  $('#tab' + tab.getId()).removeClass('unsaved');
};

MenuController.prototype.onSwitchTab = function(e, tab) {
  $('#tabs-list li.active').removeClass('active');
  $('#tab' + tab.getId()).addClass('active');
};

MenuController.prototype.newTab_ = function() {
  this.tabs_.newTab();
  return false;
};

MenuController.prototype.open_ = function() {
  this.tabs_.openFile();
  return false;
};

MenuController.prototype.save_ = function() {
  this.tabs_.save();
  return false;
};

MenuController.prototype.saveas_ = function() {
  this.tabs_.saveAs();
  return false;
};

MenuController.prototype.tabButtonClicked_ = function(id) {
  this.tabs_.showTab(id);
  return false;
};

MenuController.prototype.closeTabClicked_ = function(id) {
  this.tabs_.close(id);
};
