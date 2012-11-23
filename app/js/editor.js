var EditSession = ace.require('ace/edit_session').EditSession;

function Editor(editorElement) {
  this.element_ = editorElement;
  this.editor_ = null;
}

Editor.prototype.newSession = function(opt_content) {
  return new EditSession(opt_content || '');
};

Editor.prototype.setSession = function(session) {
  if (!this.editor_) {
    this.editor_ = ace.edit(this.element_);
  }
  this.editor_.setSession(session);
};
