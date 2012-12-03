/**
 * @constructor
 */
function Tab(id, session, entry) {
  this.id_ = id;
  this.session_ = session;
  this.entry_ = entry;
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
      $.event.trigger('tabsaved', this);
    }.bind(this);

    writer.onerror = function(e) {
      console.log('File saving failed:', fileEntry, e);
    };

    writer.write(blob);
  }.bind(this));
};


/**
 * @constructor
 */
function Tabs(editor) {
  this.editor_ = editor;
  this.tabs_ = [];
  this.currentTab_ = null;  // Tab id.
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

Tabs.prototype.showTab = function(tabId) {
  var tab = this.getTabById(tabId)
  this.editor_.setSession(tab.getSession());
  this.currentTab_ = tab;
  $.event.trigger('switchtab', tab);
};

Tabs.prototype.openFile = function() {
  chrome.fileSystem.chooseEntry(
      {'type': 'openWritableFile'},
      this.openFileEntry.bind(this));
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
      self.newTab(this.result, entry)
    };
    reader.readAsText(file);
  });
};

Tabs.prototype.onSaveAsFileOpen_ = function(entry) {
  if (!entry) {
    return;
  }
  this.currentTab_.setEntry(entry);
  this.currentTab_.save();
};

