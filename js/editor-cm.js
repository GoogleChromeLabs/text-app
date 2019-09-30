var EditSession = CodeMirror.Doc;

// taken from a chrome dev tools
// go/codemirror-a11y-hack
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
    // set cursor essentially
    this.textarea.setSelectionRange(this.textarea.value.length, this.textarea.value.length);
    this.prevInput = this.textarea.value;
  }

  /**
   * @override
   * @param {boolean=} typing
   */
  reset(typing) {
    // if typing/editing let codemirror handle the event
    if (typing || this.contextMenuPending || this.composing || this.cm.somethingSelected()) {
      super.reset(typing);
      return;
    }

    // otherwise if navigating around the document,
    // keep the current visual line in the textarea.
    const cursor = this.cm.getCursor();
    let start, end;
    if (this.cm.options.lineWrapping) {
      // To get the visual line, compute the leftmost and rightmost character positions.
      // and then pass these into getRange to get the entire line regardless of
      // what is in the textarea itself
      const top = this.cm.charCoords(cursor, 'page').top;
      start = this.cm.coordsChar({left: -Infinity, top});
      end = this.cm.coordsChar({left: Infinity, top});
    } else {
      // Limit the line to 1000 characters to prevent lag.
      const offset = Math.floor(cursor.ch / 1000) * 1000;
      // get everything on the line (up to our max of 1000)
      start = {ch: offset, line: cursor.line};
      end = {ch: offset + 1000, line: cursor.line};
    }

    let nextLine = this.cm.getRange(start, end);
    this.updateTextArea(cursor.ch - start.ch, nextLine);
  }

  /**
   * @param {number} caretPosition
   * @param {string} line
   * Change the contents of the textarea and update the caret position
   */
  updateTextArea(caretPosition, line) {
    this.textarea.value = line;
    this.prevInput = this.textarea.value;
    this.textarea.setSelectionRange(caretPosition, caretPosition);
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
        // Poll interval of ~25 days, this is to prevent codemirror from
        // deleting all of our selections
        'pollInterval': Math.pow(2, 31) - 1,
        'highlightSelectionMatches': {
          minChars: 1,
          delay: 0,
          caseInsensitive: true
        }
      });

  this.cm_.setSize(null, 'auto');
  this.cm_.on('change', this.onChange.bind(this));
  this.textarea_ = this.cm_.getInputField();
  this.prevInput_ = null;

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
 * @param {string} opt_content
 * @return {EditSession}
 * Create an edit session for a new file. Each tab should have its own session.
 */
EditorCodeMirror.prototype.newSession = function(opt_content) {
  var session = new CodeMirror.Doc(opt_content || '');
  return session;
};
/**
 * @param {EditSession} session
 * Change the current session, usually to switch to another tab.
 */
EditorCodeMirror.prototype.setSession = function(session) {
  this.cm_.swapDoc(session);
};

/**
 * @return {Search}
 * Return search object.
 */
EditorCodeMirror.prototype.getSearch = function() {
  return this.search_;
};

EditorCodeMirror.prototype.onChange = function() {
  $.event.trigger('docchange', this.cm_.getDoc());
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
 * @param {Session} session
 * @param {string} extension
 */
EditorCodeMirror.prototype.setMode = function(session, extension) {
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

var Editor = EditorCodeMirror;

