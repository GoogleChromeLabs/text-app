'use strict';

/**
 * @constructor
 * @param {DOM} elementId
 * @param {Settings} settings
 */
function EditorCodeMirror(editorElement, settings) {
  window.ecm = this;

  const CodeMirror = window.CodeMirror;
  this.element_ = editorElement;
  this.settings_ = settings;

  /** @type {window.CodeMirror.state.Compartment} for changing tab size dynamically. */
  this.tabSize_ = new window.CodeMirror.state.Compartment();

  /**
   * @type {window.CodeMirror.state.Compartment} for changing the "Wrap lines"
   * setting dynamically.
   */
  this.lineWrappingComponent_ = new window.CodeMirror.state.Compartment();

  /**
   * @type {window.CodeMirror.state.Compartment} for changing the "show line numbers"
   * setting dynamically.
   */
  this.lineNumbersComponent_ = new window.CodeMirror.state.Compartment();

  // Extensions don't need to be loaded here as we will always load a state
  // created by newState with setSession.
  this.editorView_ = new window.CodeMirror.view.EditorView({
    doc: "",
    parent: editorElement,
  })

  /*
    'autofocus': true,
    'matchBrackets': true,
    'highlightSelectionMatches': {
      minChars: 1,
      delay: 0,
      caseInsensitive: true
    }
  */

  // XXX this.setTheme(settings.get('theme'));
  this.search_ = new Search(this.editorView_);
  // Mimic Sublime behaviour there.
  // XXX this.defaultTabHandler_ = CodeMirror.commands.defaultTab;
}

EditorCodeMirror.EXTENSION_TO_MODE = {
    'bash': 'shell',
    'coffee': 'coffeescript',
    'c': 'clike',
    'c++': 'clike',
    'cc': 'clike',
    'cs': 'clike',
    'css': 'css',
    'cpp': 'clike',
    'cxx': 'clike',
    'diff': 'diff',
    'gemspec': 'ruby',
    'go': 'go',
    'h': 'clike',
    'hh': 'clike',
    'hpp': 'clike',
    'htm': 'htmlmixed',
    'html': 'htmlmixed',
    'java': 'clike',
    'js': 'javascript',
    'json': 'yaml',
    'latex': 'stex',
    'less': 'text/x-less',
    'ltx': 'stex',
    'lua': 'lua',
    'markdown': 'markdown',
    'md': 'markdown',
    'ml': 'ocaml',
    'mli': 'ocaml',
    'patch': 'diff',
    'pgsql': 'sql',
    'pl': 'perl',
    'pm': 'perl',
    'php': 'php',
    'phtml': 'php',
    'py': 'python',
    'rb': 'ruby',
    'rdf': 'xml',
    'rs': 'rust',
    'rss': 'xml',
    'ru': 'ruby',
    'sh': 'shell',
    'sql': 'sql',
    'svg': 'xml',
    'tex': 'stex',
    'xhtml': 'htmlmixed',
    'xml': 'xml',
    'xq': 'xquery',
    'yaml': 'yaml'};

EditorCodeMirror.prototype.newState = function(opt_content) {
  const CodeMirror = window.CodeMirror;
  return CodeMirror.state.EditorState.create({
    doc: opt_content || '',
    extensions: [
      CodeMirror.commands.history(),
      CodeMirror.view.drawSelection(),
      this.lineNumbersComponent_.of(CodeMirror.view.lineNumbers()),
      CodeMirror.view.keymap.of([
        ...CodeMirror.commands.defaultKeymap,
        ...CodeMirror.commands.historyKeymap,
        CodeMirror.commands.indentWithTab,
      ]),
      this.tabSize_.of(CodeMirror.state.EditorState.tabSize.of(2)),
      this.lineWrappingComponent_.of(CodeMirror.view.EditorView.lineWrapping),
      CodeMirror.search.search({
        literal: true,
      }),
    ],
  });
};

/**
 * @param {EditorState} editorState
 * Change the current session, usually to switch to another tab.
 */
EditorCodeMirror.prototype.setSession = function(editorState) {
  this.editorView_.setState(editorState);
  // Apply all settings because settings only apply to the current state but we
  // want the settings to affect all the tabs.
  this.applyAllSettings();
};

/**
 * Returns all settings which are locked to a certain value
 * when this editor is open.
 */
EditorCodeMirror.prototype.lockedSettings = function() {
  return {};
};

/**
 * @return {Search}
 * Return search object.
 */
EditorCodeMirror.prototype.getSearch = function() {
  return this.search_;
};

EditorCodeMirror.prototype.focus = function() {
  // XXX this.cm_.focus();
};

/**
 * @param {EditorState} session
 * @param {string} extension
 */
EditorCodeMirror.prototype.setMode = function(session, extension) {
  session = session.codemirror;
  var mode = EditorCodeMirror.EXTENSION_TO_MODE[extension];
  if (mode) {
    var currentSession = null;
    if (session !== this.cm_.getDoc()) {
      currentSession = this.cm_.swapDoc(session);
    }
    this.cm_.setOption('mode', mode);
    if (currentSession !== null) {
      this.cm_.swapDoc(currentSession);
    }
  }
};

/** Apply all settings to the current state. */
EditorCodeMirror.prototype.applyAllSettings = function() {
  this.setFontSize(this.settings_.get('fontsize'));
  this.showHideLineNumbers(this.settings_.get('linenumbers'));
  this.setSmartIndent(this.settings_.get('smartindent'));
  this.replaceTabWithSpaces(this.settings_.get('spacestab'));
  this.setTabSize(this.settings_.get('tabsize'));
  this.setWrapLines(this.settings_.get('wraplines'));
}

/**
 * @param {number} fontSize
 * Update font size from settings.
 */
EditorCodeMirror.prototype.setFontSize = function(fontSize) {
  // XXX $('.CodeMirror').css('font-size',fontSize + 'px');
  // XXX this.cm_.refresh();
};

/**
 * @param {number} size
 */
EditorCodeMirror.prototype.setTabSize = function(size) {
  this.editorView_.dispatch({
    effects: this.tabSize_.reconfigure(window.CodeMirror.state.EditorState.tabSize.of(size))
  });
};

/**
 * @param {string} theme The color theme to change to. Default light.
 */
EditorCodeMirror.prototype.setTheme = function(theme) {
  // XXX if (theme !== 'dark') theme = 'light';
  // XXX this.cm_.setOption('theme', theme);
};

/**
 * @param {boolean} val Whether or not to show line numbers.
 */
EditorCodeMirror.prototype.showHideLineNumbers = function(val) {
  this.editorView_.dispatch({
    effects: this.lineNumbersComponent_.reconfigure(val ? window.CodeMirror.view.lineNumbers() : [])
  });
};

/**
 * @param {boolean} val Whether or not to enable line wrapping.
 */
EditorCodeMirror.prototype.setWrapLines = function(val) {
  this.editorView_.dispatch({
    effects: this.lineWrappingComponent_.reconfigure(val ? window.CodeMirror.view.EditorView.lineWrapping : [])
  });
};

/**
 * @param {boolean} val Whether or not to enable smart indent.
 */
EditorCodeMirror.prototype.setSmartIndent = function(val) {
  // XXX this.cm_.setOption('smartIndent', val);
};

/**
 * @param {boolean} val
 */
EditorCodeMirror.prototype.replaceTabWithSpaces = function(val) {
  // XXX
  // NOTE: https://codemirror.net/examples/change/ has an example of this.
  return;

  this.cm_.setOption('indentWithTabs', !val);
  if (val) {
    // Need to update this closure once the tabsize has changed. So, have to
    // call this method when it happens.
    var tabsize = this.settings_.get('tabsize');
    CodeMirror.commands.defaultTab = function(cm) {
      if (cm.somethingSelected()) {
        cm.indentSelection("add");
      } else {
        var nspaces = tabsize - cm.getCursor().ch % tabsize;
        var spaces = Array(nspaces + 1).join(" ");
        cm.replaceSelection(spaces, "end", "+input");
      }
    };
  } else {
    CodeMirror.commands.defaultTab = this.defaultTabHandler_;
  }
};

/**
 * Make the textarea unfocusable and hide cursor.
 */
EditorCodeMirror.prototype.disable = function() {
  // XXX this.cm_.setOption('readOnly', 'nocursor');
};

EditorCodeMirror.prototype.enable = function() {
  // XXX this.cm_.setOption('readOnly', false);
  // XXX this.cm_.focus();
};

/**
 * Prepare the Editor to be killed and removed from the DOM
 */
EditorCodeMirror.prototype.destroy = function() {
  // Detach the current doc so it can be reset in future.
  // XXX this.cm_.swapDoc(new CodeMirror.Doc(''));
};
