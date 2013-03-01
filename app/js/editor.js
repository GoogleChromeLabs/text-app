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
  this.editor_.setFontSize('14px');
  this.editor_.setShowFoldWidgets(false);
  $(document).bind('resize', this.editor_.resize.bind(this.editor_));
  $(document).bind('tabrenamed', this.onTabRenamed_.bind(this));
}

Editor.EXTENSION_TO_MODE = {
    'bash': 'sh',
    'bib': 'latex',
    'cfm': 'coldfusion',
    'clj': 'clojure',
    'coffee': 'coffee',
    'c': 'c_cpp',
    'c++': 'c_cpp',
    'cc': 'c_cpp',
    'cs': 'csharp',
    'css': 'css',
    'cpp': 'c_cpp',
    'cxx': 'c_cpp',
    'diff': 'diff',
    'gemspec': 'ruby',
    'go': 'golang',
    'groovy': 'groovy',
    'h': 'c_cpp',
    'hh': 'c_cpp',
    'hpp': 'c_cpp',
    'htm': 'html',
    'html': 'html',
    'hx': 'haxe',
    'java': 'java',
    'js': 'javascript',
    'json': 'json',
    'latex': 'latex',
    'less': 'less',
    'liquid': 'liquid',
    'ltx': 'latex',
    'lua': 'lua',
    'markdown': 'markdown',
    'md': 'markdown',
    'ml': 'ocaml',
    'mli': 'ocaml',
    'patch': 'diff',
    'pgsql': 'pgsql',
    'pl': 'perl',
    'pm': 'perl',
    'php': 'php',
    'phtml': 'php',
    'ps1': 'powershell',
    'py': 'python',
    'rb': 'ruby',
    'rdf': 'xml',
    'rss': 'xml',
    'ru': 'ruby',
    'rake': 'rake',
    'scad': 'scad',
    'scala': 'scala',
    'sass': 'scss',
    'scss': 'scss',
    'sh': 'sh',
    'sql': 'sql',
    'svg': 'svg',
    'tex': 'latex',
    'txt': 'txt',
    'textile': 'textile',
    'xhtml': 'html',
    'xml': 'xml',
    'xq': 'xquery',
    'yaml': 'yaml'};

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

  var cssText = '';
  for (var i = 0; i < stylesheet.cssRules.length; i++) {
    cssText += '\n' + stylesheet.cssRules[i].cssText;
  }

  ace.define(
    'ace/theme/textdrive',
    ['require', 'exports', 'module', 'ace/lib/dom'],
    function(require, exports, module) {
      exports.cssClass = 'ace-td';
      exports.cssText = cssText;
      var dom = require('../lib/dom');
      dom.importCssString(exports.cssText, exports.cssClass);
    });

   this.editor_.setTheme('ace/theme/textdrive');
};

Editor.prototype.newSession = function(opt_content) {
  session = new EditSession(opt_content || '');

  var mode = session.getMode();
  mode.getNextLineIndent = function(state, line, tab) {
    return this.$getIndent(line);
  };

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

Editor.prototype.focus = function() {
  this.editor_.focus();
};

/**
 * @param {Session} session
 * @param {string} extension
 */
Editor.prototype.setMode = function(session, extension) {
  var mode = Editor.EXTENSION_TO_MODE[extension];
  if (mode)
    session.setMode('ace/mode/' + mode);
};

/**
 * @param {Event} e
 * @param {Tab} tab
 */
Editor.prototype.onTabRenamed_ = function(e, tab) {
  var extension = tab.getExtension();
  if (extension)
    this.setMode(tab.getSession(), extension);
};
