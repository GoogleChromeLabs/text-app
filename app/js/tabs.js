function Tab(id, name, session) {
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
 * @costructor
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

Tabs.prototype.newTab = function() {
  var id = 1;
  while (this.getTabById(id)) {
    id++;
  }

  var name = 'Untitled ' + id;
  var session = this.editor_.newSession()
  var tab = new Tab(id, name, session);
  this.tabs_.push(tab);
  return tab;
};

Tabs.prototype.showTab = function(tabId) {
  this.editor_.setSession(this.getTabById(tabId).getSession());
};
