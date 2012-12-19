var EditSession = ace.require('ace/edit_session').EditSession;
var UndoManager = ace.require('ace/undomanager').UndoManager;

/**
 * @constructor
 */
function Editor(editorElement) {
  this.element_ = editorElement;
  this.editor_ = ace.edit(this.element_);
  this.initTheme_();
  this.editor_.on('change', this.onChange.bind(this));
  this.editor_.setShowPrintMargin(false);
  this.editor_.setFontSize(20);
  $(document).bind('resize', this.editor_.resize.bind(this.editor_));
}

Editor.prototype.initTheme_ = function() {
  var stylesheet = null;

  for (var i = 0; i < document.styleSheets.length; i++) {
      if (document.styleSheets[i].href &&
          document.styleSheets[i].href.indexOf("ace.css") ) {
        stylesheet = document.styleSheets[i];
        break;
      }
  }

  if (!stylesheet) {
    console.error('Didn\'t find stylesheet for Ace');
  }
    
  ace.define(
    'ace/theme/chrome',
    ['require', 'exports', 'module', 'ace/lib/dom'],
    function(require, exports, module) {
      exports.cssClass = "ace-chrome";
      exports.cssText = ;

      var dom = require("../lib/dom");
      dom.importCssString(exports.cssText, exports.cssClass);
    });
};

Editor.prototype.newSession = function(opt_content) {
  session = new EditSession(opt_content || '');
  var undoManager = new UndoManager();
  session.setUndoManager(undoManager);
  session.setUseWrapMode(true);
  return session;
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
  this.editor_.undo();
};

Editor.prototype.redo = function() {
  this.editor_.redo();
};
