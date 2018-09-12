/**
 * @constructor
 */
function MenuController(tabs) {
  this.tabs_ = tabs;
  this.dragItem_ = null;
  $('#file-menu-new').click(this.newTab_.bind(this));
  $('#file-menu-open').click(this.open_.bind(this));
  $('#file-menu-save').click(this.save_.bind(this));
  $('#file-menu-saveas').click(this.saveas_.bind(this));
  $(document).bind('newtab', this.addNewTab_.bind(this));
  $(document).bind('switchtab', this.onSwitchTab.bind(this));
  $(document).bind('tabchange', this.onTabChange.bind(this));
  $(document).bind('tabclosed', this.onTabClosed.bind(this));
  $(document).bind('tabpathchange', this.onTabPathChange.bind(this));
  $(document).bind('tabrenamed', this.onTabRenamed.bind(this));
  $(document).bind('tabsave', this.onTabSave.bind(this));
}

MenuController.prototype.addNewTab_ = function(e, tab) {
  let id = tab.getId();
  let tabElement = document.createElement("li");
  tabElement.setAttribute('draggable', 'true');
  tabElement.id = 'tab' + id;
  let filenameElement = document.createElement("div");
  filenameElement.appendChild(document.createTextNode(tab.getName()));
  filenameElement.className = "filename";
  tabElement.appendChild(filenameElement);
  let closeElement = document.createElement("div");
  closeElement.setAttribute('title', chrome.i18n.getMessage('closeFileButton'))
  closeElement.className = "close";
  tabElement.appendChild(closeElement);
  document.getElementById('tabs-list').appendChild(tabElement);

  tabElement.addEventListener(
      'dragstart', this.onDragStart_.bind(this, $(tabElement)));
  tabElement.addEventListener(
      'dragover', this.onDragOver_.bind(this, $(tabElement)));
  tabElement.addEventListener(
      'dragend', this.onDragEnd_.bind(this, $(tabElement)));
  tabElement.addEventListener(
      'drop', this.onDrop_.bind(this, $(tabElement)));
  tabElement.addEventListener(
      'click', this.tabButtonClicked_.bind(this, id));
  closeElement.addEventListener(
      'click', this.closeTabClicked_.bind(this, id));
};

MenuController.prototype.onDragStart_ = function(listItem, e) {
  this.dragItem_ = listItem;
};

MenuController.prototype.onDragEnd_ = function(listItem, e) {
  this.dragItem_ = null;
  e.preventDefault();
  e.stopPropagation();
};

MenuController.prototype.onDrop_ = function(listItem, e) {
  e.stopPropagation();
};

MenuController.prototype.onDragOver_ = function(overItem, e) {
  e.preventDefault();
  if (!this.dragItem_ || overItem.attr('id') === this.dragItem_.attr('id'))
    return;

  if (this.dragItem_.index() < overItem.index()) {
    overItem.after(this.dragItem_);
  } else {
    overItem.before(this.dragItem_);
  }
  this.tabs_.reorder(this.dragItem_.index(), overItem.index());
};

MenuController.prototype.onTabRenamed = function(e, tab) {
  $('#tab' + tab.getId() + ' .filename').text(tab.getName());
  this.tabs_.modeAutoSet(tab);
};

MenuController.prototype.onTabPathChange = function(e, tab) {
  $('#tab' + tab.getId() + ' .filename').attr('title', tab.getPath());
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
  this.tabs_.openFiles();
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
