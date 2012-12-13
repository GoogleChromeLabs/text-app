/**
 * @constructor
 */
function Tab(id, session, entry) {
  this.id_ = id;
  this.session_ = session;
  this.entry_ = entry;
  this.saved_ = true;
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

Tab.prototype.getSession = function() {
  return this.session_;
};

Tab.prototype.setEntry = function(entry) {
  var nameChanged = this.getName() != entry.name;
  this.entry_ = entry;
  if (nameChanged)
    $.event.trigger('tabrenamed', this);
};

Tab.prototype.getEntry = function() {
  return this.entry_;
};

Tab.prototype.save = function() {
  this.entry_.createWriter(function(writer) {
    var blob = new Blob([this.session_.getValue()], {type: 'text/plain'});

    writer.onwriteend = function(e) {
      this.saved_ = true;
      $.event.trigger('tabsave', this);
    }.bind(this);

    writer.onerror = function(e) {
      console.warning('File saving failed:', fileEntry, e);
    };

    writer.write(blob);
  }.bind(this));
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
function Tabs(editor) {
  this.editor_ = editor;
  this.tabs_ = [];
  this.currentTab_ = null;
  $(document).bind('docchange', this.onDocChanged_.bind(this));
}

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

Tabs.prototype.newTab = function(opt_content, opt_entry) {
  var id = 1;
  while (this.getTabById(id)) {
    id++;
  }

  var session = this.editor_.newSession(opt_content)
  var tab = new Tab(id, session, opt_entry || null);
  this.tabs_.push(tab);
  $.event.trigger('newtab', tab);
  this.showTab(tab.getId());
};

Tabs.prototype.nextTab = function() {
  for (var i = 0; i < this.tabs_.length; i++) {
    if (this.tabs_[i] === this.currentTab_) {
      var next = i + 1;
      if (next === this.tabs_.length)
        next = 0;
      if (next !== i)
        this.showTab(this.tabs_[next].getId());
      return;
    }
  }
};

Tabs.prototype.showTab = function(tabId) {
  var tab = this.getTabById(tabId)
  this.editor_.setSession(tab.getSession());
  this.currentTab_ = tab;
  $.event.trigger('switchtab', tab);
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

  // TODO: Confirmation window in case of unsaved file.

  if (tab === this.currentTab_) {
    if (this.tabs_.length > 1)
      this.nextTab();
    else
      this.newTab();
  }  

  this.tabs_.splice(i, 1);
  $.event.trigger('tabclosed', tab);

};

Tabs.prototype.closeCurrent = function() {
  this.close(this.currentTab_.getId());
};

Tabs.prototype.openFile = function() {
  chrome.fileSystem.chooseEntry(
      {'type': 'openWritableFile'},
      this.openFileEntry.bind(this));
};

Tabs.prototype.save = function() {
  if (this.currentTab_.getEntry()) {
    this.currentTab_.save();
  } else {
    this.saveAs();
  }
};

Tabs.prototype.saveAs = function() {
  chrome.fileSystem.chooseEntry(
      {'type': 'saveFile'},
      this.onSaveAsFileOpen_.bind(this));
};

Tabs.prototype.openFileEntry = function(entry) {
  if (!entry) {
    return;
  }

  var self = this;
  entry.file(function(file) {
    var reader = new FileReader();
    reader.onerror = function(err) {
      console.error('Error while reading file:', err);
    };
    reader.onloadend = function(e) {
      self.newTab(this.result, entry);
      if (self.tabs_.length === 2 &&
          !self.tabs_[0].getEntry() &&
          self.tabs_[0].isSaved()) {
        self.close(self.tabs_[0].getId());
      }
    };
    reader.readAsText(file);
  }.bind(this));
};

Tabs.prototype.onSaveAsFileOpen_ = function(entry) {
  if (!entry) {
    return;
  }
  this.currentTab_.setEntry(entry);
  this.currentTab_.save();
};

Tabs.prototype.onDocChanged_ = function(e, session) {
  var tab = this.currentTab_;
  if (this.currentTab_.getSession() !== session) {
    console.warning('Something wrong. Current session should be',
                    this.currentTab_.getSession(),
                    ', but this session was changed:',
                    session);
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
