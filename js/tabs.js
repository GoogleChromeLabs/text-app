/**
 * @constructor
 * @param {number} id
 * @param {window.CodeMirror.state.EditorState} session Edit session.
 * @param {string} lineEndings What character(s) to use as the line ending.
 * @param {FileEntry} entry
 */
function Tab(id, session, lineEndings, entry, dialogController) {
  this.id_ = id;
  /** @type {window.CodeMirror.state.EditorState} */
  this.session_ = session;
  /** @type {string} Separator between lines. */
  this.lineEndings_ = lineEndings;
  /** @type {FileEntry} */
  this.entry_ = entry;
  this.saved_ = true;
  this.path_ = null;
  this.dialogController_ = dialogController;
  if (this.entry_)
    this.updatePath_();
};

Tab.prototype.getId = function() {
  return this.id_;
};

Tab.prototype.getName = function() {
  if (this.entry_) {
    return this.entry_.name;
  } else {
    // TODO: i18n 'Untitled' text
    return 'Untitled ' + this.id_;
  }
};

/**
 * @return {string?} Filename extension or null.
 */
Tab.prototype.getExtension = function() {
  if (!this.entry_)
    return null;

  return util.getExtension(this.getName());
};

Tab.prototype.getSession = function() {
  return this.session_;
};

Tab.prototype.setSession = function(session) {
  return this.session_ = session;
};

/**
 * @param {FileEntry} entry
 */
Tab.prototype.setEntry = function(entry) {
  var nameChanged = this.getName() != entry.name;
  this.entry_ = entry;
  if (nameChanged)
    $.event.trigger('tabrenamed', this);
  this.updatePath_();
};

Tab.prototype.getEntry = function() {
  return this.entry_;
};

Tab.prototype.getPath = function() {
  return this.path_;
};

Tab.prototype.updatePath_ = function() {
  chrome.fileSystem.getDisplayPath(this.entry_, function(path) {
    this.path_ = path;
    $.event.trigger('tabpathchange', this);
  }.bind(this));
};

/** Get the contents of the file in the tab. */
Tab.prototype.getContent_ = function() {
  // Files with mixed line endings will get normalized to whatever we guessed.
  // We could set the EditorState.lineSeparator facet to make round-trips work,
  // but other GUI Linux text editors also seem to normalize.
  return this.session_.doc.toString().split('\n').join(this.lineEndings_);
};

Tab.prototype.save = function(opt_callbackDone) {
  util.writeFile(
    this.entry_, this.getContent_(),
    function() {
      this.saved_ = true;
      $.event.trigger('tabsave', this);
      if (opt_callbackDone)
        opt_callbackDone();
    }.bind(this),
    this.reportWriteError_.bind(this));
};

Tab.prototype.reportWriteError_ = function(e) {
  this.dialogController_.setText(
      // TODO: Replace this with i18n message
      'Error saving file: ' + util.fsErrorStr(e));
  this.dialogController_.resetButtons();
  this.dialogController_.addButton('ok',
      chrome.i18n.getMessage('okDialogButton'));
  this.dialogController_.show();
};

Tab.prototype.isSaved = function() {
  return this.saved_;
};

Tab.prototype.changed = function() {
  if (this.saved_) {
    this.saved_ = false;
    $.event.trigger('tabchange', this);
  }
};


/**
 * @constructor
 * @param {EditorCodeMirror} editor
 */
function Tabs(editor, dialogController, settings) {
  /** @type {EditorCodeMirror} */
  this.editor_ = editor;
  this.dialogController_ = dialogController;
  this.settings_ = settings;
  /** @type {Tab[]} */
  this.tabs_ = [];
  /** @type {Tab|null} Current selected tab, or initially null. */
  this.currentTab_ = null;

  $(document).bind('docchange', this.onDocChanged_.bind(this));
}

/**
 * @type {Object} params
 * @type {function(FileEntry)} callback
 * Open a file in the system file picker. The FileEntry is copied to be stored
 * in background page, so it isn't destroyed when the window is closed.
 */
Tabs.prototype.chooseEntry = function(params, callback) {
  // TODO: Remove this when crbug.com/326523 is fixed.
  if (params.acceptsMultiple) {
    console.error('acceptsMultiple is not supported when saving a file');
    return;
  }
  chrome.fileSystem.chooseEntry(
      params,
      function(entry) {
        if (entry) {
          chrome.runtime.getBackgroundPage(function(bg) {
            bg.background.copyFileEntry(entry, callback);
          });
        }
      });
};

/**
 * @type {Object} params
 * @type {function(FileEntry)} callback
 * @type {function()} opt_oncancel
 * Open one or multiple files in the system file picker. File Entries are
 * copied to be stored in background page, so they aren't destroyed when the
 * window is closed. Callback is called once for each File Entry.
 */
Tabs.prototype.chooseEntries = function(params, callback, opt_oncancel) {
  params.acceptsMultiple = true;
  chrome.fileSystem.chooseEntry(
      params,
      function(entries) {
        if (entries) {
          chrome.runtime.getBackgroundPage(function(bg) {
            for (var i = 0; i < entries.length; i++)
              bg.background.copyFileEntry(entries[i], callback);
          });
        } else {
          if (opt_oncancel)
            opt_oncancel();
        }
      });
};

Tabs.prototype.getTabById = function(id) {
  for (var i = 0; i < this.tabs_.length; i++) {
    if (this.tabs_[i].getId() === id)
      return this.tabs_[i];
  }
  return null;
};

Tabs.prototype.getCurrentTab = function() {
  return this.currentTab_;
};

Tabs.prototype.newWindow = function() {
  chrome.runtime.getBackgroundPage(function(bg) {
    bg.background.newWindow();
  }.bind(this));
};

/**
 * Add a new tab.
 *
 * @param {?string} opt_content What text content the tab should contain. Otherwise it starts empty.
 */
Tabs.prototype.newTab = function(opt_content, opt_entry) {
  var id = 1;
  while (this.getTabById(id)) {
    id++;
  }

  var session = this.editor_.newState(opt_content);
  var lineEndings = util.guessLineEndings(opt_content);

  var tab = new Tab(id, session, lineEndings, opt_entry || null,
                    this.dialogController_);
  this.tabs_.push(tab);
  $.event.trigger('newtab', tab);
  this.showTab(tab.getId());
};

/**
 * @param {number} oldIndex
 * @param {number} newIndex
 * Move a {Tab} from oldIndex to newIndex
 */
Tabs.prototype.reorder = function (oldIndex, newIndex) {
  this.tabs_.splice(
      newIndex, // specifies at what position to add items
      0, // no items will be removed
      this.tabs_.splice(oldIndex, 1)[0]); // item to be added
};

Tabs.prototype.getTabIndex = function(tab) {
  for (var i = 0; i < this.tabs_.length; i++) {
    if (this.tabs_[i] === tab)
      return i;
  }
  return -1;
}

Tabs.prototype.previousTab = function() {
  var currentTabIndex = this.getTabIndex(this.currentTab_);
  var previousTabIndex = currentTabIndex - 1;
  if (previousTabIndex < 0)
    previousTabIndex = this.tabs_.length - 1;
  this.showTab(this.tabs_[previousTabIndex].getId());
};

Tabs.prototype.nextTab = function() {
  var currentTabIndex = this.getTabIndex(this.currentTab_);
  var nextTabIndex = currentTabIndex + 1;
  if (nextTabIndex >= this.tabs_.length)
    nextTabIndex = 0;
  this.showTab(this.tabs_[nextTabIndex].getId());
};

Tabs.prototype.showTab = function(tabId) {
  if (this.currentTab_) {
    // Before switching tabs, write the editorView's state to the tab.
    this.updateCurrentTabState_();
  }

  var tab = this.getTabById(tabId)
  if (!tab) {
    console.error('Can\'t find tab', tabId);
    return;
  }
  this.editor_.setSession(tab.getSession(), tab.getExtension());
  this.currentTab_ = tab;
  $.event.trigger('switchtab', tab);
  this.editor_.focus();
};

Tabs.prototype.close = function(tabId) {
  for (var i = 0; i < this.tabs_.length; i++) {
    if (this.tabs_[i].getId() == tabId)
      break;
  }

  if (i >= this.tabs_.length) {
    console.error('Can\'t find tab', tabId);
    return;
  }

  var tab = this.tabs_[i];

  if (!tab.isSaved()) {
    this.promptSave_(tab, function(answer) {
      if (answer === 'yes') {
        this.save(tab, this.closeTab_.bind(this, tab));
      } else if (answer === 'no') {
        this.closeTab_(tab);
      }
    }.bind(this));
  } else {
    this.closeTab_(tab);
  }
};

/**
 * @param {Tab} tab
 * Close tab without checking whether it needs to be saved. The safe version
 * (invoking auto-save and, if needed, SaveAs dialog) is Tabs.close().
 */
Tabs.prototype.closeTab_ = function(tab) {
  if (tab === this.currentTab_) {
    if (this.tabs_.length > 1) {
      this.nextTab();
    } else {
      window.close();
    }
  }

  for (var i = 0; i < this.tabs_.length; i++) {
    if (this.tabs_[i] === tab)
      break;
  }

  this.tabs_.splice(i, 1);
  $.event.trigger('tabclosed', tab);
};

/**
 * This is needed because EditorState is immutable. So if you open a tab and
 * edit the contents, the EditorView's state won't match the tab's session state.
 */
Tabs.prototype.updateCurrentTabState_ = function() {
  if (!this.currentTab_) return;
  this.currentTab_.setSession(this.editor_.editorView_.state);
}

Tabs.prototype.closeCurrent = function() {
  this.close(this.currentTab_.getId());
};

Tabs.prototype.openFiles = function() {
  this.chooseEntries(
      {'type': 'openWritableFile'},
      this.openFileEntry.bind(this));
};

/**
 * @param {function()} callback
 * Invoke the save dialog for all tabs with unsaved progress. Does not close any tabs.
 */
Tabs.prototype.promptAllUnsaved = function(callback) {
  this.promptAllUnsavedFromIndex_(0, callback);
};

Tabs.prototype.promptAllUnsavedFromIndex_ = function(i, callback) {
  if (i >= this.tabs_.length) {
    callback();
    return;
  }

  var tab = this.tabs_[i];
  if (tab.isSaved()) {
    this.promptAllUnsavedFromIndex_(i + 1, callback);
  } else {
    this.showTab(this.tabs_[i].getId());
    this.promptSave_(tab, function(answer) {
      if (answer === 'yes') {
        this.save(
          tab, this.promptAllUnsavedFromIndex_.bind(this, i + 1, callback));
      } else if (answer === 'no') {
        this.promptAllUnsavedFromIndex_(i + 1, callback);
      }
    }.bind(this));
  }
};

/**
 * Prompts the user if they want to save a file.
 * @param {!Tab} tab The tab corresponding to the file to be saved.
 * @param {function(string)} callbackShowDialog Called when the save dialog box
 *     is resolved. Takes as an argument string corresponding to the dialog
 *     button selected by the user.
 */
Tabs.prototype.promptSave_ = function(tab, callbackShowDialog) {
  this.dialogController_.setText(
      chrome.i18n.getMessage('saveFilePromptLine1', tab.getName()),
      chrome.i18n.getMessage('saveFilePromptLine2')
  );
  this.dialogController_.resetButtons();
  this.dialogController_.addButton('yes',
      chrome.i18n.getMessage('yesDialogButton'));
  this.dialogController_.addButton('no',
      chrome.i18n.getMessage('noDialogButton'));
  this.dialogController_.addButton('cancel',
      chrome.i18n.getMessage('cancelDialogButton'));
  this.dialogController_.show(callbackShowDialog);
};

/**
 * Save opt_tab, or the current tab if no opt_tab is passed.
 * @param {?Tab=} opt_tab Optional tab to save.
 * @param {function()=} opt_callback
 */
Tabs.prototype.save = function(opt_tab, opt_callback) {
  var tab = opt_tab || this.currentTab_;

  // Update the tab's editorState if it's the current tab.
  if (tab && tab === this.currentTab_) {
    this.updateCurrentTabState_();
  }

  if (tab.getEntry()) {
    tab.save(opt_callback);
  } else {
    this.saveAs(tab, opt_callback);
  }
};

/**
 * Save opt_tab as a new file, or the current tab if no opt_tab is passed.
 * @param {?Tab=} opt_tab
 * @param {function()=} opt_callback
 */
Tabs.prototype.saveAs = function(opt_tab, opt_callback) {
  var tab = opt_tab || this.currentTab_;
  if (tab && tab === this.currentTab_) {
    this.updateCurrentTabState_();
  }

  var suggestedName = tab.getEntry() && tab.getEntry().name ||
                      util.sanitizeFileName(tab.session_.doc.line(1).text) ||
                      tab.getName();

  if (!util.getExtension(suggestedName)) {
      suggestedName += '.txt';
  }
  this.chooseEntry(
      {'type': 'saveFile', 'suggestedName': suggestedName},
      function(entry) {
        this.saveEntry_(tab, entry, opt_callback);
        if (opt_callback) {
          opt_callback();
        }
      }.bind(this));
};

/**
 * Invoke the save dialog for all tabs with unsaved progress. Does not close any tabs.
 */
Tabs.prototype.saveAll = function() {
  this.saveAllFromIndex_(0);
}

Tabs.prototype.saveAllFromIndex_ = function(i) {
  if (i >= this.tabs_.length) {
    return;
  }

  var tab = this.tabs_[i];
  if (tab.isSaved()) {
    this.saveAllFromIndex_(i + 1);
  } else {
    this.save(
      tab, this.saveAllFromIndex_.bind(this, i + 1));
  }
}

/**
 * @return {Array.<FileEntry>}
 */
Tabs.prototype.getFilesToRetain = function() {
  var toRetain = [];

  for (i = 0; i < this.tabs_.length; i++) {
    if (this.tabs_[i].getEntry()) {
      toRetain.push(this.tabs_[i].getEntry());
    }
  }

  return toRetain;
};

Tabs.prototype.openFileEntry = function(entry) {
  chrome.fileSystem.getDisplayPath(entry, function(path) {
    for (var i = 0; i < this.tabs_.length; i++) {
      if (this.tabs_[i].getPath() === path) {
        this.showTab(this.tabs_[i].getId());
        return;
      }
    }

    entry.file(this.readFileToNewTab_.bind(this, entry));
  }.bind(this));
};

/**
 * Sets the mode for a tab depending on its extension.
 *
 * @param {Tab} tab The tab corresponding to the file to be saved.
 */
Tabs.prototype.modeAutoSet = function(tab) {
  // Only set the mode if it's the current tab. The mode for non-current tabs
  // will update when they become the current tab.
  if (tab !== this.currentTab_) return;
  var extension = tab.getExtension();
  if (extension) {
    this.editor_.updateMode(extension);
  }
};

Tabs.prototype.readFileToNewTab_ = function(entry, file) {
  $.event.trigger('loadingfile');
  var self = this;
  var reader = new FileReader();
  reader.onerror = util.handleFSError;
  reader.onloadend = function(e) {
    self.newTab(this.result, entry);
    if (self.tabs_.length === 2 &&
        !self.tabs_[0].getEntry() &&
        self.tabs_[0].isSaved()) {
      self.close(self.tabs_[0].getId());
    }
  };
  reader.readAsText(file);
}

/**
 * @param {!Tab} tab
 * @param {FileEntry} entry
 * @param {function()=} opt_callback
 */
Tabs.prototype.saveEntry_ = function(tab, entry, opt_callback) {
  if (!entry) {
    return;
  }

  tab.setEntry(entry);
  this.save(tab, opt_callback);
};

/**
 * The event handler for the docchange event.
 */
Tabs.prototype.onDocChanged_ = function() {
  this.currentTab_.changed();
}

/**
 * Determines whether any tabs are open.
 * @return {boolean} True if at least one tab is open.
 */
Tabs.prototype.hasOpenTab = function() {
  return !!this.tabs_.length;
};
