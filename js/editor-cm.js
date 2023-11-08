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
  this.tabSize_ = new CodeMirror.state.Compartment();

  /** @type {window.CodeMirror.state.Compartment} for changing indent unit dynamically. */
  this.indentUnitCompartment_ = new CodeMirror.state.Compartment();

  /**
   * @type {window.CodeMirror.state.Compartment} for changing the language
   * dynamically to match the file extension.
   */
  this.langComponent_ = new CodeMirror.state.Compartment();

  /**
   * @type {window.CodeMirror.state.Compartment} for changing the "Wrap lines"
   * setting dynamically.
   */
  this.lineWrappingComponent_ = new CodeMirror.state.Compartment();

  /**
   * @type {window.CodeMirror.state.Compartment} for changing the "show line numbers"
   * setting dynamically.
   */
  this.lineNumbersComponent_ = new CodeMirror.state.Compartment();

  /** @type {window.CodeMirror.state.Compartment} for setting light/dark mode. */
  this.themeCompartment_ = new CodeMirror.state.Compartment();

  const themeStyles = {
    "&": {
      backgroundColor: "var(--ta-background-color)",
      color: "var(--ta-editor-text-color)",
    },
    ".cm-content": {
      fontSize: "var(--ta-editor-font-size)",
      lineHeight: "1.2",
    },
    ".cm-gutter": {
      backgroundColor: "var(--ta-background-color)",
      color: "var(--ta-editor-line-number-text-color)",
      fontSize: "var(--ta-editor-font-size)",
      lineHeight: "1.2",
    },
    ".cm-cursor": {
      borderLeftColor: "var(--ta-editor-text-color)",
    },
    "&.cm-focused .cm-selectionBackground": {
      backgroundColor: "var(--ta-editor-selection-focus-color) !important",
    },
    ".cm-selectionBackground": {
      backgroundColor: "var(--ta-editor-selection-color) !important",
    },
    ".cm-matchingBracket": {
      backgroundColor: "inherit !important",
      color: "var(--ta-editor-text-color) !important",
      borderBottom: "1px solid var(--ta-editor-text-color)",
    },
    ".cm-nonmatchingBracket": {
      backgroundColor: "inherit !important",
    },
  };

  this.lightTheme_ = CodeMirror.view.EditorView.theme(themeStyles, {dark: false});
  this.darkTheme_ = CodeMirror.view.EditorView.theme(themeStyles, {dark: true});

  /**
   * Extensions don't need to be loaded here because we will always load a
   * state created by newState with setSession.
   * 
   * @type {window.CodeMirror.view.EditorView}
   */
  this.editorView_ = new CodeMirror.view.EditorView({
    doc: "",
    parent: editorElement,
  })

  /*
    'autofocus': true,
  */

  this.search_ = new Search(this.editorView_);
}

EditorCodeMirror.EXTENSION_TO_MODE = {
    'bash': 'shell',
    'coffee': 'coffeescript',
    'c': 'cpp',
    'c++': 'cpp',
    'cc': 'cpp',
    'cs': 'cpp',
    'css': 'css',
    'cpp': 'cpp',
    'cxx': 'cpp',
    'diff': 'diff',
    'gemspec': 'ruby',
    'go': 'go',
    'h': 'cpp',
    'hh': 'cpp',
    'hpp': 'cpp',
    'htm': 'html',
    'html': 'html',
    'java': 'java',
    'js': 'javascript',
    'json': 'json',
    'latex': 'stex',
    'less': 'less',
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
    'xhtml': 'html',
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
      CodeMirror.language.bracketMatching(),
      this.langComponent_.of(CodeMirror.lang.javascript()),
      this.lineNumbersComponent_.of(CodeMirror.view.lineNumbers()),
      CodeMirror.view.keymap.of([
        ...CodeMirror.commands.defaultKeymap,
        ...CodeMirror.commands.historyKeymap,
        {
          key: 'Tab',
          preventDefault: true,
          run: ({state, dispatch}) => {
            // Get the setting value again because it might have changed.
            const useSpace = this.settings_.get('spacestab');

            // If the indent unit is tab, use the built-in insertTab function.
            if (!useSpace) {
              return window.CodeMirror.commands.insertTab({state, dispatch});
            }
            // If something is selected, use the built-in indentMore function.
            // It automatically handles spaces vs tabs.
            if (state.selection.ranges.some(r => !r.empty)) {
              return window.CodeMirror.commands.indentMore({state, dispatch});
            }

            const indentContext = new window.CodeMirror.language.IndentContext(state);
            const cursorColumn = indentContext.column(state.selection.main.head);

            // Insert the number of spaces equivalent to a tab.
            const tabSize = indentContext.unit;
            const numSpaces = tabSize - cursorColumn % tabSize;
            dispatch(state.update(state.replaceSelection(' '.repeat(numSpaces)),
                {scrollIntoView: true, userEvent: "input"}));
            return true;
          },
        },
        {
          key: 'Shift-Tab',
          preventDefault: true,
          run: CodeMirror.commands.indentSelection,  // XXX: Need to make indent auto work.
        },
      ]),
      this.tabSize_.of(CodeMirror.state.EditorState.tabSize.of(2)),
      this.indentUnitCompartment_.of(window.CodeMirror.language.indentUnit.of('  ')),
      this.lineWrappingComponent_.of(CodeMirror.view.EditorView.lineWrapping),
      CodeMirror.view.EditorView.updateListener.of(this.onViewUpdate.bind(this)),
      CodeMirror.search.search({
        literal: true,
      }),
      this.themeCompartment_.of(this.lightTheme_),
    ],
  });
};

/**
 * Change the current session, usually to switch to another tab.
 *
 * @param {EditorState} editorState
 * @param {string} extension file extension.
 */
EditorCodeMirror.prototype.setSession = function(editorState, extension) {
  this.editorView_.setState(editorState);
  // Apply all settings because settings only apply to the current state but we
  // want the settings to affect all the tabs.
  this.applyAllSettings();

  const mode = EditorCodeMirror.EXTENSION_TO_MODE[extension];
  if (mode && window.CodeMirror.lang[mode]) {
    this.editorView_.dispatch({
      effects: this.langComponent_.reconfigure(window.CodeMirror.lang[mode]())
    });
  } else {
    // Reset the language if no mode found.
    this.editorView_.dispatch({
      effects: this.langComponent_.reconfigure([])
    });
  }
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
  this.editorView_.focus();
};

/**
 * @param {EditorState} editorState
 * @param {string} extension
 */
EditorCodeMirror.prototype.setMode = function(editorState, extension) {
  // XXX: Remove this function if it isn't needed.

  // var mode = EditorCodeMirror.EXTENSION_TO_MODE[extension];
  // if (mode) {
  //   var currentSession = null;
  //   if (session !== this.cm_.getDoc()) {
  //     currentSession = this.cm_.swapDoc(session);
  //   }
  //   this.cm_.setOption('mode', mode);
  //   if (currentSession !== null) {
  //     this.cm_.swapDoc(currentSession);
  //   }
  // }
};

/** Apply all settings to the current state. */
EditorCodeMirror.prototype.applyAllSettings = function() {
  this.setTheme(this.settings_.get('theme'));
  this.setFontSize(this.settings_.get('fontsize'));
  this.showHideLineNumbers(this.settings_.get('linenumbers'));
  this.setSmartIndent(this.settings_.get('smartindent'));
  this.setReplaceTabWithSpaces(this.settings_.get('spacestab'));
  this.setTabSize(this.settings_.get('tabsize'));
  this.setWrapLines(this.settings_.get('wraplines'));
}

/**
 * @param {number} fontSize
 * Update font size from settings.
 */
EditorCodeMirror.prototype.setFontSize = function(fontSize) {
  // The "proper" way to do this might be to create a new theme, but this is
  // easier. Force a redraw so line numbers get positioned correctly.
  this.element_.style.setProperty('--ta-editor-font-size', fontSize + 'px');
  this.editorView_.setState(this.editorView_.state);
};

/**
 * @param {number} size
 */
EditorCodeMirror.prototype.setTabSize = function(size) {  
  const useSpace = this.settings_.get('spacestab');
  this.editorView_.dispatch({
    effects: [
      this.tabSize_.reconfigure(window.CodeMirror.state.EditorState.tabSize.of(size)),
      this.getIndentUnitStateEffect(useSpace, size),
    ]
  });
};

/**
 * Creates a StateEffect that can be used to change the indent unit.
 * 
 * @param {boolean} useSpace If true the indent unit will be spaces. Otherwise it a tab character.
 * @param {number} tabSize Number of spaces equal to the size of a tab.
 */
EditorCodeMirror.prototype.getIndentUnitStateEffect = function(useSpace, tabSize) {
  const indentUnit = useSpace ? ' '.repeat(tabSize) : '\t';
  return this.indentUnitCompartment_.reconfigure(window.CodeMirror.language.indentUnit.of(indentUnit));
};

/**
 * @param {string} theme The color theme to change to. Default light.
 */
EditorCodeMirror.prototype.setTheme = function(theme) {
  this.editorView_.dispatch({
    effects: this.themeCompartment_.reconfigure(theme === "dark" ? this.darkTheme_ : this.lightTheme_),
  });
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
 * @param {boolean} useSpace Whether or not to indent with spaces. False means indent with tabs.
 */
EditorCodeMirror.prototype.setReplaceTabWithSpaces = function(useSpace) {
  const tabsize = this.settings_.get('tabsize');
  this.editorView_.dispatch({
    effects: [this.getIndentUnitStateEffect(useSpace, tabsize)],
  });
};

/**
 * @param {ViewUpdate} update
 */
EditorCodeMirror.prototype.onViewUpdate = function(update) {
  if (update.docChanged) {
    $.event.trigger('docchange');
  }
};
