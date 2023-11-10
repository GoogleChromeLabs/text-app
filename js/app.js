/**
 * @constructor
 */
function TextApp() {
  /** @type {EditorCodeMirror} */
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
  this.settings_ = new Settings();
  // Editor is initalised after settings are ready.
  this.editor_ = null;

  if (this.settings_.isReady()) {
    this.onSettingsReady_();
  } else {
    $(document).bind('settingsready', this.onSettingsReady_.bind(this));
  }
  $(document).bind('settingschange', this.onSettingsChanged_.bind(this));
};

/**
 * Open one tab per FileEntry passed or a new Untitled tab if no tabs were
 * successfully opened.
 * @param {!Array.<FileEntry>} entries The file entries to be opened.
 */
TextApp.prototype.openTabs = function(entries) {
  for (var i = 0; i < entries.length; i++) {
    this.tabs_.openFileEntry(entries[i]);
  }
  this.windowController_.focus_();
  if (!this.tabs_.hasOpenTab()) {
    this.tabs_.newTab();
  }
};

TextApp.prototype.setHasChromeFrame = function(hasFrame) {
  this.hasFrame_ = hasFrame;
  this.windowController_.windowControlsVisible(!hasFrame);
};

/**
 * @return {Array.<FileEntry>}
 */
TextApp.prototype.getFilesToRetain = function() {
  return this.tabs_.getFilesToRetain();
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
  this.settingsController_ = new SettingsController(this.settings_);

  this.initEditor_();

  this.windowController_.setAlwaysOnTop(this.settings_.get('alwaysontop'));

  chrome.runtime.getBackgroundPage(function(bg) {
    bg.background.onWindowReady(this);
  }.bind(this));
};

/**
 * Create all of the controllers the editor needs.
 */
TextApp.prototype.initControllers_ = function() {
  this.dialogController_ =
      new DialogController($('#dialog-container'), this.editor_);
  this.tabs_ = new Tabs(this.editor_, this.dialogController_, this.settings_);
  this.menuController_ = new MenuController(this.tabs_);
  this.windowController_ =
      new WindowController(this.editor_, this.settings_, this.tabs_);
  this.hotkeysController_ = new HotkeysController(
      this.windowController_, this.tabs_, this.editor_, this.settings_,
      this.settingsController_);
  this.searchController_ = new SearchController(this.editor_.getSearch());
};

/**
 * Loads all settings into the current editor.
 */
TextApp.prototype.loadSettingsIntoEditor = function() {
  this.setTheme();
  this.editor_.applyAllSettings();
};

/**
 * Create a new editor and load all settings.
 */
TextApp.prototype.initEditor_ = function() {
  if (this.editor_) {
    console.error("Trying to re-initialize text app");
    return;
  }

  const editor = document.getElementById('editor');
  this.editor_ = new EditorCodeMirror(editor, this.settings_);
  this.initControllers_();
  this.loadSettingsIntoEditor();
};

/**
 * @param {Event} e
 * @param {string} key
 * @param {*} value
 */
TextApp.prototype.onSettingsChanged_ = function(e, key, value) {
  switch (key) {
    case 'alwaysontop':
      this.windowController_.setAlwaysOnTop(value);
      break;

    case 'fontsize':
      this.editor_.setFontSize(value);
      break;

    case 'linenumbers':
      this.editor_.showHideLineNumbers(value);
      break;

    case 'spacestab':
      this.editor_.setReplaceTabWithSpaces(this.settings_.get('spacestab'));
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

const textApp = new TextApp();

document.addEventListener('DOMContentLoaded', function() {
  textApp.init();
});
