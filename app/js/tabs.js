function Tab(id, name, session, opt_content) {
  this.name_ = name;
  this.id_ = id;
  this.session_ = session;
};

Tab.prototype.getID = function() {
  return this.id_;
};

Tab.prototype.getName = function() {
  return this.name_;
};

Tab.prototype.getSession = function() {
  return this.session_;
};


/**
 * @constructor
 */
function Tabs(editor) {
  this.editor_ = editor;
  this.tabs_ = [];
}

Tabs.prototype.getTabById = function(id) {
  for (var i = 0; i < this.tabs_.length; i++) {
    if (this.tabs_[i].getID() === id)
      return this.tabs_[i];
  }
  return null;
};

Tabs.prototype.newTab = function(opt_name, opt_content) {
  var id = 1;
  while (this.getTabById(id)) {
    id++;
  }

  var name = opt_name || 'Untitled ' + id;
  var session = this.editor_.newSession(opt_content)
  var tab = new Tab(id, name, session);
  this.tabs_.push(tab);
  $.event.trigger('newtab', tab);
  this.showTab(tab.getID());
};

Tabs.prototype.showTab = function(tabId) {
  var tab = this.getTabById(tabId)
  this.editor_.setSession(tab.getSession());
  $.event.trigger('switchtab', tab);
};

Tabs.prototype.onFileOpen = function(entry) {
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
      self.newTab(entry.name, this.result)
    };
    reader.readAsText(file);
  });
};
