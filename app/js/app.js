/**
 * @constructor
 */
function TextDrive() {
  this.editor_ = null;
  this.tabs_ = null;
  this.menuController_ = null;
  this.windowController_ = null;
}

/**
 * Called when all the resources have loaded. All initializations should be done
 * here.
 */
TextDrive.prototype.init = function() {
  this.editor_ = new Editor('editor');
  this.tabs_ = new Tabs(this.editor_);
  this.menu_controller_ = new MenuController(this.tabs_);
  this.windowController_ = new WindowController();
  this.searchController_ = new SearchController(this.editor_);

  chrome.runtime.getBackgroundPage(function(bg) {
    bg.onWindowReady(this);
  }.bind(this));
};

/**
 * @param {Array.<FileEntry>} entries The file entries to be opened.
 *
 * Open one tab per file. Usually called from the background page.
 */
TextDrive.prototype.openEntries = function(entries) {
  for (var i = 0; i < entries.length; i++) {
    this.tabs_.openFileEntry(entries[i]);
  }
};

var textDrive = new TextDrive();

$(document).ready(textDrive.init.bind(textDrive));
