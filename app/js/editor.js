var EditSession = ace.require('ace/edit_session').EditSession;

/**
 * @constructor
 */
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

Editor.prototype.find = function(string) {
  var selection = this.editor_.getSelectionRange();
  options = {'wrap': true,
             'start': selection.start};
  this.editor_.find(string, options, true);
};

Editor.prototype.findNext = function() {
  this.editor_.findNext({'wrap': true}, true);
};

Editor.prototype.clearSearch = function() {
  var selection = this.editor_.getSelectionRange();
  this.editor_.moveCursorToPosition(selection.start);
};
