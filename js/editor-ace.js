var EditSession = ace.require('ace/edit_session').EditSession;
var UndoManager = ace.require('ace/undomanager').UndoManager;

/**
 * @constructor
 * @param {string} elementId
 */
function EditorAce(element, settings) {
  this.element_ = element;
  this.settings_ = settings;
  this.themeCss_ = null;
  this.editor_ = ace.edit(element.id());
  this.initThemes_();
  this.editor_.on('change', this.onChange.bind(this));
  this.editor_.setShowPrintMargin(false);
  this.editor_.setShowFoldWidgets(false);
  this.editor_.commands.bindKey('ctrl-shift-l', null);
  this.editor_.commands.bindKey(
      'Ctrl-Up', function(editor) { editor.navigateFileStart(); })
  this.editor_.commands.bindKey(
      'Ctrl-Down', function(editor) { editor.navigateFileEnd(); })
  $(document).bind('resize', this.editor_.resize.bind(this.editor_));
  $(document).bind('tabrenamed', this.onTabRenamed_.bind(this));
}

EditorAce.EXTENSION_TO_MODE = {
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

EditorAce.prototype.initThemes_ = function() {
  var stylesheet;
  var match;
  var cssText;
  var name;
  var themeAceModule;

  function initThemeModule(name, css, require, exports, module) {
    exports.cssClass = 'ace-text-' + name;
    exports.cssText = css;
    var dom = require('../lib/dom');
    dom.importCssString(exports.cssText, exports.cssClass);
  }

  for (var i = 0; i < document.styleSheets.length; i++) {
    if (!document.styleSheets[i].href)
      continue;
    match = document.styleSheets[i].href.match(/theme-(\w+)\.css$/);
    if (!match)
      continue;
    name = match[1];
    stylesheet = document.styleSheets[i];

    cssText = '';
    for (var j = 0; j < stylesheet.cssRules.length; j++) {
      cssText += '\n' + stylesheet.cssRules[j].cssText;
    }

    ace.define(
        'ace/theme/text_' + name,
        ['require', 'exports', 'module', 'ace/lib/dom'],
        initThemeModule.bind(null, name, cssText));
  }
};

/**
 * @param {string} opt_content
 * @return {EditSession}
 * Create an edit session for a new file. Each tab should have its own session.
 */
EditorAce.prototype.newSession = function(opt_content) {
  var session = new EditSession(opt_content || '');

  var mode = session.getMode();
  mode.getNextLineIndent = function(state, line, tab) {
    return this.$getIndent(line);
  };

  var undoManager = new UndoManager();
  session.setUndoManager(undoManager);
  session.setUseWrapMode(this.settings_.get('wraplines'));
  return session;
};

/**
 * @param {EditSession} session
 * Change the current session, e.g. to edit another tab.
 */
EditorAce.prototype.setSession = function(session) {
  this.editor_.setSession(session);
};

EditorAce.prototype.find = function(string) {
  var selection = this.editor_.getSelectionRange();
  var options = {'wrap': true,
                 'start': selection.start};
  this.editor_.find(string, options, true);
};

EditorAce.prototype.findNext = function() {
  this.editor_.findNext({'wrap': true}, true);
};

EditorAce.prototype.clearSearch = function() {
  var selection = this.editor_.getSelectionRange();
  this.editor_.moveCursorToPosition(selection.start);
};

EditorAce.prototype.onChange = function(e) {
  $.event.trigger('docchange', this.editor_.getSession());
};

EditorAce.prototype.undo = function() {
  this.editor_.undo();
};

EditorAce.prototype.redo = function() {
  this.editor_.redo();
};

EditorAce.prototype.focus = function() {
  this.editor_.focus();
};

/**
 * @param {Session} session
 * @param {string} extension
 */
EditorAce.prototype.setMode = function(session, extension) {
  var mode = EditorAce.EXTENSION_TO_MODE[extension];
  if (mode)
    session.setMode('ace/mode/' + mode);
};

/**
 * @param {Event} e
 * @param {Tab} tab
 */
EditorAce.prototype.onTabRenamed_ = function(e, tab) {
  var extension = tab.getExtension();
  if (extension)
    this.setMode(tab.getSession(), extension);
};

/**
 * @param {number} fontSize
 * Update font size from settings.
 */
EditorAce.prototype.setFontSize = function(fontSize) {
  this.editor_.setFontSize(Math.round(fontSize) + 'px');
};

/**
 * @param {boolean} show
 */
EditorAce.prototype.showHideLineNumbers_ = function(show) {
  $('#' + this.elementId_).toggleClass('hide-line-numbers', !show);
  this.editor_.resize(true /* force */);
};

/**
 * @param {string} theme
 */
EditorAce.prototype.setTheme_ = function() {
  this.editor_.setTheme('ace/theme/text_' + theme);
};

/**
 * @param {boolean} show
 * @param {number} col
 */
EditorAce.prototype.showHideMargin = function(show, col) {
};

/**
 * @param {EditSession} session
 * @return {string}
 */
EditorAce.prototype.getContents = function(session) {
  return session.getValue();
};

/**
 * @param {EditSession} session
 * @param {number} size
 */
EditorAce.prototype.setTabSize = function(session, size) {
  session.setTabSize(size);
};

var Editor = EditorAce;
