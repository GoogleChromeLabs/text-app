/**
 * @constructor
 * @param {number} id
 * @param {EditSession} session Edit session.
 * @param {FileEntry} entry
 */
function Tab(id, session, lineEndings, entry, dialogController) {
  this.id_ = id;
  this.session_ = session;
  this.lineEndings_ = lineEndings;
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

Tab.prototype.getContent_ = function() {
  return this.session_.getValue(this.lineEndings_);
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
 */
function Tabs(editor, dialogController, settings) {
  this.editor_ = editor;
  this.dialogController_ = dialogController;
  this.settings_ = settings;
  this.tabs_ = [];
  this.currentTab_ = null;
  $(document).bind('docchange', this.onDocChanged_.bind(this));
}

/**
 * @type {Object} params
 * @type {function(FileEntry)} callback
 * @type {function()} opt_oncancel
 * Open a file in the system file picker. The FileEntry is copied to be stored
 * in background page, so it isn't destroyed when the window is closed.
 */
Tabs.prototype.chooseEntry = function(params, callback, opt_oncancel) {
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
        } else {
          if (opt_oncancel)
            opt_oncancel();
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

Tabs.prototype.getCurrentTab = function(id) {
  return this.currentTab_;
};

Tabs.prototype.newWindow = function() {
  chrome.runtime.getBackgroundPage(function(bg) {
    bg.background.newWindow();
  }.bind(this));
};

Tabs.prototype.newTab = function(opt_content, opt_entry) {
  var id = 1;
  while (this.getTabById(id)) {
    id++;
  }

  var session = this.editor_.newSession(opt_content);
  var lineEndings = util.guessLineEndings(opt_content);

  var tab = new Tab(id, session, lineEndings, opt_entry || null,
                    this.dialogController_);
  this.tabs_.push(tab);
  $.event.trigger('newtab', tab);
  this.showTab(tab.getId());
  var fileNameExtension = tab.getExtension();
  if (fileNameExtension)
    this.editor_.setMode(session, fileNameExtension);
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
  var tab = this.getTabById(tabId)
  this.editor_.setSession(tab.getSession());
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
    this.dialogController_.setText(
        chrome.i18n.getMessage('saveFilePrompt'));
    this.dialogController_.resetButtons();
    this.dialogController_.addButton('yes',
        chrome.i18n.getMessage('yesDialogButton'));
    this.dialogController_.addButton('no',
        chrome.i18n.getMessage('noDialogButton'));
    this.dialogController_.addButton('cancel',
        chrome.i18n.getMessage('cancelDialogButton'));
    this.dialogController_.show(function(answer) {
      if (answer === 'yes') {
        this.save(tab, true /* close */);
        return;
      }

      if (answer === 'no') {
        this.closeTab_(tab);
        return;
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

Tabs.prototype.closeCurrent = function() {
  this.close(this.currentTab_.getId());
};

Tabs.prototype.openFiles = function() {
  this.chooseEntries(
      {'type': 'openWritableFile'},
      this.openFileEntry.bind(this));
};

Tabs.prototype.save = function(opt_tab, opt_close) {
  if (!opt_tab)
    opt_tab = this.currentTab_;
  if (opt_tab.getEntry()) {
    var callback = null;
    if (opt_close)
      callback = this.closeTab_.bind(this, opt_tab);
    opt_tab.save(callback);
  } else {
    this.saveAs(opt_tab, opt_close);
  }
};

Tabs.prototype.saveAs = function(opt_tab, opt_close) {
  if (!opt_tab)
    opt_tab = this.currentTab_;
  var suggestedName = opt_tab.getEntry() && opt_tab.getEntry().name ||
                      util.sanitizeFileName(opt_tab.session_.getLine(0)) ||
                      opt_tab.getName();
  if (!util.getExtension(suggestedName)) {
      suggestedName += '.txt';
  }
  this.chooseEntry(
      {'type': 'saveFile', 'suggestedName': suggestedName},
      this.onSaveAsFileOpen_.bind(this, opt_tab, opt_close || false));
};

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

Tabs.prototype.modeAutoSet = function(tab) {
  var extension = tab.getExtension();
  if (extension) {
    this.editor_.setMode(tab.getSession(), extension);
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

Tabs.prototype.onSaveAsFileOpen_ = function(tab, close, entry) {
  if (!entry) {
    return;
  }

  tab.setEntry(entry);
  this.save(tab, close);
};

Tabs.prototype.onDocChanged_ = function(e, session) {
  var tab = this.currentTab_;
  if (this.currentTab_.getSession() !== session) {
    console.warn('Something wrong. Current session should be',
                 this.currentTab_.getSession(),
                 ', but this session was changed:', session);
    for (var i = 0; i < this.tabs_; i++) {
      if (this.tabs_[i].getSession() === session) {
        tab = this.tabs_[i];
        break;
      }
    }

    if (tab === this.currentTab_) {
      console.error('Unkown tab changed.');
      return;
    }
  }

  tab.changed();
};
