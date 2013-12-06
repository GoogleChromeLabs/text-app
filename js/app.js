/**
 * @constructor
 */
function TextApp() {
  this.editor_ = null;
  this.settings_ = null;
  this.tabs_ = null;

  this.dialogController_ = null;
  this.hotkeysController_ = null;
  this.menuController_ = null;
  this.searchController_ = null;
  this.settingsController_ = null;
  this.windowController_ = null;

  this.hasFrame_ = false;
}

/**
 * Called when all the resources have loaded. All initializations should be done
 * here.
 */
TextApp.prototype.init = function() {
  this.dialogController_ = new DialogController($('#dialog-container'))

  this.settings_ = new Settings();
  this.editor_ = new Editor($('#editor')[0], this.settings_);
  this.tabs_ = new Tabs(this.editor_, this.dialogController_, this.settings_);

  this.hotkeysController_ = new HotkeysController(
      this.tabs_, this.editor_, this.settings_);
  this.menuController_ = new MenuController(this.tabs_);
  this.searchController_ = new SearchController(this.editor_);
  this.settingsController_ = new SettingsController(this.settings_);
  this.windowController_ = new WindowController(this.editor_, this.settings_);

  if (this.settings_.isReady()) {
    this.onSettingsReady_();
  } else {
    $(document).bind('settingsready', this.onSettingsReady_.bind(this));
  }
  $(document).bind('settingschange', this.onSettingsChanged_.bind(this));

  chrome.runtime.getBackgroundPage(function(bg) {
    bg.background.onWindowReady(this);
  }.bind(this));
};

/**
 * @param {Array.<FileEntry>} entries The file entries to be opened.
 *
 * Open one tab per file. Usually called from the background page.
 */
TextApp.prototype.openEntries = function(entries) {
  for (var i = 0; i < entries.length; i++) {
    this.tabs_.openFileEntry(entries[i]);
  }
};

TextApp.prototype.openNew = function() {
  this.tabs_.newTab();
};

TextApp.prototype.setHasChromeFrame = function(hasFrame) {
  this.hasFrame_ = hasFrame;
  this.windowController_.windowControlsVisible(!hasFrame);
};

/**
 * @return {Array.<Object>} Each element:
 *     {entry: <FileEntry>, contents: <string>}.
 */
TextApp.prototype.getFilesToSave = function() {
  if (this.settings_.get('autosave')) {
    return this.tabs_.getFilesToSave();
  } else {
    return [];
  }
};

TextApp.prototype.setTheme = function() {
  var theme = this.settings_.get('theme');
  this.windowController_.setTheme(theme);
  this.editor_.setTheme(theme);
};

/**
 * Called when all the services have started and settings are loaded.
 */
TextApp.prototype.onSettingsReady_ = function() {
  this.setTheme();
  this.editor_.setFontSize(this.settings_.get('fontsize'));
  this.editor_.showHideLineNumbers(this.settings_.get('linenumbers'));
  this.editor_.showHideMargin(this.settings_.get('margin'),
                              this.settings_.get('margincol'));
  this.editor_.setSmartIndent(this.settings_.get('smartindent'));
  this.editor_.replaceTabWithSpaces(this.settings_.get('spacestab'));
  this.editor_.setTabSize(this.settings_.get('tabsize'));
  this.editor_.setWrapLines(this.settings_.get('wraplines'));
};

/**
 * @param {Event} e
 * @param {string} key
 * @param {*} value
 */
TextApp.prototype.onSettingsChanged_ = function(e, key, value) {
  switch (key) {
    case 'fontsize':
      this.editor_.setFontSize(value);
      break;

    case 'linenumbers':
      this.editor_.showHideLineNumbers(value);
      break;

    case 'margin':
    case 'margincol':
      this.editor_.showHideMargin(this.settings_.get('margin'),
                                  this.settings_.get('margincol'));
      break;

    case 'smartindent':
      this.editor_.setSmartIndent(value);
      break;

    case 'spacestab':
      this.editor_.replaceTabWithSpaces(this.settings_.get('spacestab'));
      break;

    case 'tabsize':
      this.editor_.setTabSize(value);
      break;

    case 'theme':
      this.setTheme();
      break;

    case 'wraplines':
      this.editor_.setWrapLines(value);
      break;
  }
};

var textApp = new TextApp();

$(document).ready(textApp.init.bind(textApp));
