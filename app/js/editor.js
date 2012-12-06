var EditSession = ace.require('ace/edit_session').EditSession;

/**
 * @constructor
 */
function Editor(editorElement) {
  this.element_ = editorElement;
  this.editor_ = ace.edit(this.element_);
  this.editor_.on('change', this.onChange.bind(this));
}

Editor.prototype.newSession = function(opt_content) {
  return new EditSession(opt_content || '');
};

Editor.prototype.setSession = function(session) {
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

Editor.prototype.onChange = function(e) {
  $.event.trigger('docchange', this.editor_.getSession());
};

Editor.prototype.undo = function() {
  console.log('undo');
  this.editor_.undo();
};

Editor.prototype.redo = function() {
  console.log('redo');
  this.editor_.redo();
};
