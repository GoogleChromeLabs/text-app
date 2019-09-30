var EditSession = CodeMirror.Doc;

// The devToolsAccessibleTextArea class was taken from chrome dev tools to help
// improve codemirror screen reader support for navigating around a document.
// https://github.com/ChromeDevTools/devtools-frontend/blob/0ddf8e4898701ab4174096707346d71cc5985268/front_end/text_editor/CodeMirrorTextEditor.js#L1736


// CodeMirror uses an offscreen <textarea> to detect input. Due to
// inconsistencies in the many browsers it supports, it simplifies things by
// regularly checking if something is in the textarea, adding those characters
// to the document, and then clearing the textarea. This breaks assistive
// technology that wants to read from CodeMirror, because the <textarea> that
// they interact with is constantly empty. Because we target chrome on
// chrome os, we can gaurantee consistent input events. This lets us leave the
// current line from the editor in our <textarea>.
// CodeMirror still expects a mostly empty <textarea>, so we pass CodeMirror a
// fake <textarea> that only contains the users input.
CodeMirror.inputStyles.devToolsAccessibleTextArea = class extends CodeMirror.inputStyles.textarea {
  /**
   * @override
   * @param {!Object} display
   */
  init(display) {
    super.init(display);
    this.textarea.addEventListener('compositionstart', this._onCompositionStart.bind(this));
  }

  _onCompositionStart() {
    if (this.textarea.selectionEnd === this.textarea.value.length)
      return;
    // CodeMirror always expects the caret to be at the end of the textarea
    // When in IME composition mode, clip the textarea to how CodeMirror expects it,
    // and then let CodeMirror do it's thing.
    this.textarea.value = this.textarea.value.substring(0, this.textarea.selectionEnd);
    this.textarea.setSelectionRange(this.textarea.value.length, this.textarea.value.length);
    this.prevInput = this.textarea.value;
  }

  /**
   * @override
   * @param {boolean=} typing
   */
  reset(typing) {
    if (typing || this.contextMenuPending || this.composing || this.cm.somethingSelected()) {
      super.reset(typing);
      return;
    }

    // When navigating around the document, keep the current visual line in the textarea.
    const cursor = this.cm.getCursor();
    let start, end;
    if (this.cm.options.lineWrapping) {
      // To get the visual line, compute the leftmost and rightmost character positions.
      const top = this.cm.charCoords(cursor, 'page').top;
      start = this.cm.coordsChar({left: -Infinity, top});
      end = this.cm.coordsChar({left: Infinity, top});
    } else {
      // Limit the line to 1000 characters to prevent lag.
      const offset = Math.floor(cursor.ch / 1000) * 1000;
      start = {ch: offset, line: cursor.line};
      end = {ch: offset + 1000, line: cursor.line};
    }
    this.textarea.value = this.cm.getRange(start, end);
    const caretPosition = cursor.ch - start.ch;
    this.textarea.setSelectionRange(caretPosition, caretPosition);
    this.prevInput = this.textarea.value;
  }

  /**
   * @override
   * @return {boolean}
   */
  poll() {
    if (this.contextMenuPending || this.composing)
      return super.poll();
    const text = this.textarea.value;
    let start = 0;
    const length = Math.min(this.prevInput.length, text.length);
    while (start < length && this.prevInput[start] === text[start])
      ++start;
    let end = 0;
    while (end < length - start && this.prevInput[this.prevInput.length - end - 1] === text[text.length - end - 1])
      ++end;

    // CodeMirror expects the user to be typing into a blank <textarea>.
    // Pass a fake textarea into super.poll that only contains the users input.
    /** @type {!HTMLTextAreaElement} */
    const placeholder = this.textarea;
    this.textarea = /** @type {!HTMLTextAreaElement} */ (document.createElement('textarea'));
    this.textarea.value = text.substring(start, text.length - end);
    this.textarea.setSelectionRange(placeholder.selectionStart - start, placeholder.selectionEnd - start);
    this.prevInput = '';
    const result = super.poll();
    this.prevInput = text;
    this.textarea = placeholder;
    return result;
  }
};

/**
 * @constructor
 * @param {DOM} elementId
 * @param {Settings} settings
 */
function EditorCodeMirror(editorElement, settings) {
  this.element_ = editorElement;
  this.settings_ = settings;
  this.cm_ = CodeMirror(
      editorElement,
      {
        'value': '',
        'autofocus': true,
        'matchBrackets': true,
        'inputStyle': 'devToolsAccessibleTextArea',
        // this is 25 days in milliseconds, we set the poll interval to be
        // incredibly long so that a poll doesn't break our selection logic.
        // We can remove the need for the poll because we only target chrome on
        // chrome os which handles events consistently, the poll is for other
        // browsers with less reliable input events, which we can ignore here.
        'pollInterval': Math.pow(2, 31) - 1,
        'highlightSelectionMatches': {
          minChars: 1,
          delay: 0,
          caseInsensitive: true
        }
      });
  this.cm_.setSize(null, 'auto');
  this.cm_.on('change', this.onChange.bind(this));
  this.setTheme();
  this.search_ = new Search(this.cm_);
  // Mimic Sublime behaviour there.
  this.defaultTabHandler_ = CodeMirror.commands.defaultTab;
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

/**
 * @param {SessionDescriptor} session
 * Change the current session, usually to switch to another tab.
 */
EditorCodeMirror.prototype.setSession = function(session) {
  this.cm_.swapDoc(session.codemirror);
  this.currentSession_ = session;
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

EditorCodeMirror.prototype.onChange = function() {
  $.event.trigger('docchange', {
    type: 'codemirror',
    session: this.currentSession_
  });
};

EditorCodeMirror.prototype.undo = function() {
  this.cm_.undo();
};

EditorCodeMirror.prototype.redo = function() {
  this.cm_.redo();
};

EditorCodeMirror.prototype.focus = function() {
  this.cm_.focus();
};

/**
 * @param {SessionDescriptor} session
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

/**
 * @param {number} fontSize
 * Update font size from settings.
 */
EditorCodeMirror.prototype.setFontSize = function(fontSize) {
  $('.CodeMirror').css('font-size',fontSize + 'px');
  this.cm_.refresh();
};

/**
 * @param {number} size
 */
EditorCodeMirror.prototype.setTabSize = function(size) {
  this.cm_.setOption('tabSize', size);
  this.cm_.setOption('indentUnit', size);
  this.replaceTabWithSpaces(this.settings_.get('spacestab'));
};

/**
 * @param {string} theme
 */
EditorCodeMirror.prototype.setTheme = function(theme) {
  this.cm_.setOption('theme', theme || 'default');
};

/**
 * @param {boolean} val
 */
EditorCodeMirror.prototype.showHideLineNumbers = function(val) {
  this.cm_.setOption('lineNumbers', val);
};

/**
 * @param {boolean} val
 */
EditorCodeMirror.prototype.setWrapLines = function(val) {
  this.cm_.setOption('lineWrapping', val);
};

/**
 * @param {boolean} val
 */
EditorCodeMirror.prototype.setSmartIndent = function(val) {
  this.cm_.setOption('smartIndent', val);
};

/**
 * @param {boolean} val
 */
EditorCodeMirror.prototype.replaceTabWithSpaces = function(val) {
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
  this.cm_.setOption('readOnly', 'nocursor');
};

EditorCodeMirror.prototype.enable = function() {
  this.cm_.setOption('readOnly', false);
  this.cm_.focus();
};

/**
 * Prepare the Editor to be killed and removed from the DOM
 */
EditorCodeMirror.prototype.destory = function() {
  // detach the current doc so it can be reset in future
  this.cm_.swapDoc(new CodeMirror.Doc(''));
};
