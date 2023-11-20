'use strict';

/**
 * @constructor
 * @param {DOM} elementId
 * @param {Settings} settings
 */
function EditorCodeMirror(editorElement, settings) {
  const CodeMirror = window.CodeMirror;
  this.element_ = editorElement;
  this.settings_ = settings;

  /** @type {window.CodeMirror.state.Compartment} for enabling/disabling the editor. */
  this.editableCompartment_ = new CodeMirror.state.Compartment();

  /** @type {window.CodeMirror.state.Compartment} for changing tab size dynamically. */
  this.tabSizeCompartment_ = new CodeMirror.state.Compartment();

  /** @type {window.CodeMirror.state.Compartment} for changing indent unit dynamically. */
  this.indentUnitCompartment_ = new CodeMirror.state.Compartment();

  /**
   * @type {window.CodeMirror.state.Compartment} for changing the language
   * dynamically to match the file extension.
   */
  this.langCompartment_ = new CodeMirror.state.Compartment();

  /**
   * @type {window.CodeMirror.state.Compartment} for changing the "Wrap lines"
   * setting dynamically.
   */
  this.lineWrappingCompartment_ = new CodeMirror.state.Compartment();

  /**
   * @type {window.CodeMirror.state.Compartment} for changing the "show line numbers"
   * setting dynamically.
   */
  this.lineNumbersCompartment_ = new CodeMirror.state.Compartment();

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
    ".cm-dropCursor": {
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
    ".cm-line": {
      cursor: "auto",
    }
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

  this.search_ = new Search(this.editorView_);
}

EditorCodeMirror.EXTENSION_TO_MODE = {
    'bash': 'shell',
    'coffee': 'coffeeScript',
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
    'yaml': 'yaml'};

{
  const t = window.CodeMirror.highlight.tags;
  EditorCodeMirror.HIGHLIGHT_STYLE = window.CodeMirror.language.HighlightStyle.define([
    {tag: t.variableName, color: 'var(--ta-token-variable-color)'},
    {tag: t.definition(t.variableName), color: 'var(--ta-token-definition-color)'},
    {tag: t.propertyName, color: 'var(--ta-token-property-color)'},
    {tag: [t.typeName, t.className, t.namespace, t.macroName], color: 'var(--ta-token-type-color)'},
    {tag: [t.special(t.name), t.constant(t.className)], color: 'var(--ta-token-variable-special-color)'},
    {tag: t.standard(t.variableName), color: 'var(--ta-token-builtin-color)'},
    {tag: [t.number, t.literal, t.unit], color: 'var(--ta-token-number-color)'},
    {tag: t.string, color: 'var(--ta-token-string-color)'},
    {tag: [t.special(t.string), t.regexp, t.escape], color: 'var(--ta-token-string-special-color)'},
    {tag: [t.atom, t.unit, t.labelName, t.bool], color: 'var(--ta-token-atom-color)'},
    {tag: t.keyword, color: 'var(--ta-token-keyword-color)'},
    {tag: [t.comment, t.quote], color: 'var(--ta-token-comment-color)'},
    {tag: t.invalid, backgroundColor: 'var(--ta-token-invalid-background-color)', color: 'var(--ta-token-invalid-color) !important'},
    {tag: t.meta, color: 'var(--ta-token-meta-color)'},
    {tag: t.tagName, color: 'var(--ta-token-tag-color)'},
    {tag: t.attributeName, color: 'var(--ta-token-attribute-color)'},
    {tag: t.attributeValue, color: 'var(--ta-token-attribute-value-color)'},
    {tag: t.heading, color: 'var(--ta-token-heading-color)'},
    {tag: t.quote, color: 'var(--ta-token-quote-color)'},
    {tag: t.link, color: 'var(--ta-token-link-color)'},
    {tag: t.url, color: 'var(--ta-token-url-color)'},
    {tag: t.inserted, color: 'var(--ta-token-inserted-color)'},
    {tag: t.deleted, color: 'var(--ta-token-deleted-color)'},
    {tag: t.contentSeparator, color: 'var(--ta-token-content-separator-color)'},
    {tag: t.strong, fontWeight: 'bold'},
    {tag: t.emphasis, fontStyle: 'italic'},
  ]);
}

EditorCodeMirror.prototype.newState = function(opt_content) {
  const CodeMirror = window.CodeMirror;
  return CodeMirror.state.EditorState.create({
    doc: opt_content || '',
    extensions: [
      CodeMirror.commands.history(),
      CodeMirror.view.drawSelection(),
      CodeMirror.view.dropCursor(),
      CodeMirror.language.bracketMatching(),
      this.langCompartment_.of(CodeMirror.lang.javascript()),
      this.lineNumbersCompartment_.of(CodeMirror.view.lineNumbers()),
      CodeMirror.view.keymap.of([
        {
          key: 'Enter',
          run: ({ state, dispatch }) => {
            if (this.settings_.get('smartindent')) {
              return window.CodeMirror.commands.insertNewlineAndIndent({state, dispatch});
            }
            // This copies CodeMirror's insertNewlineAndIndent but with some differences:
            // It doesn't check for matching brackets or an indent context.
            // So it just indents the new line the same as the the line before, which
            // matches CM5's behavior when `smartIndent` is false.
            if (state.readOnly) return false;
            const changes = state.changeByRange(range => {
              let { from, to } = range, line = state.doc.lineAt(from);
              const indent = window.CodeMirror.state.countColumn(/^\s*/.exec(
                state.doc.lineAt(from).text)[0], state.tabSize);

              while (to < line.to && /\s/.test(line.text[to - line.from])) to++;
              if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from))) {
                from = line.from;
              }
              const insert = ["", window.CodeMirror.language.indentString(state, indent)];
              return {
                changes: { from, to, insert: window.CodeMirror.state.Text.of(insert) },
                range: window.CodeMirror.state.EditorSelection.cursor(from + 1 + insert[1].length)
              }
            });
            dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
            return true;
          },
        },
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
          run: CodeMirror.commands.indentSelection,
        },
        {
          key: 'Ctrl-d',
          run: CodeMirror.commands.deleteLine,
        },
      ]),
      this.editableCompartment_.of(CodeMirror.view.EditorView.editable.of(true)),
      this.tabSizeCompartment_.of(CodeMirror.state.EditorState.tabSize.of(2)),
      this.indentUnitCompartment_.of(window.CodeMirror.language.indentUnit.of('  ')),
      this.lineWrappingCompartment_.of(CodeMirror.view.EditorView.lineWrapping),
      CodeMirror.view.EditorView.updateListener.of(this.onViewUpdate.bind(this)),
      CodeMirror.search.search({
        literal: true,
      }),
      this.themeCompartment_.of(this.lightTheme_),
      CodeMirror.language.syntaxHighlighting(EditorCodeMirror.HIGHLIGHT_STYLE),
    ],
  });
};

/**
 * Change the current session, usually to switch to another tab.
 *
 * @param {EditorState} editorState
 * @param {string} fileExtension
 */
EditorCodeMirror.prototype.setSession = function(editorState, fileExtension) {
  this.editorView_.setState(editorState);
  // Apply all settings because settings only apply to the current state but we
  // want the settings to affect all the tabs.
  this.applyAllSettings();
  this.updateMode(fileExtension);
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
 * Updates the EditorView's mode to match the file extension.
 *
 * @param {string} fileExtension
 */
EditorCodeMirror.prototype.updateMode = function(fileExtension) {
  let extension;
  const mode = EditorCodeMirror.EXTENSION_TO_MODE[fileExtension];
  if (mode) {
    const lang = window.CodeMirror.lang[mode];

    if (typeof lang === "object") {
      // Legacy parser
      extension = window.CodeMirror.language.StreamLanguage.define(lang);
    } else if (typeof lang === "function") {
      extension = lang();
    }
  }

  if (extension !== undefined) {
    this.editorView_.dispatch({
      effects: this.langCompartment_.reconfigure(extension)
    });
  } else {
    // Reset the language if no mode found.
    this.editorView_.dispatch({
      effects: this.langCompartment_.reconfigure([])
    });
  }
};

/** Apply all settings to the current state. */
EditorCodeMirror.prototype.applyAllSettings = function() {
  this.setTheme(this.settings_.get('theme'));
  this.setFontSize(this.settings_.get('fontsize'));
  this.showHideLineNumbers(this.settings_.get('linenumbers'));
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
      this.tabSizeCompartment_.reconfigure(window.CodeMirror.state.EditorState.tabSize.of(size)),
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
    effects: this.lineNumbersCompartment_.reconfigure(val ? window.CodeMirror.view.lineNumbers() : [])
  });
};

/**
 * @param {boolean} val Whether or not to enable line wrapping.
 */
EditorCodeMirror.prototype.setWrapLines = function(val) {
  this.editorView_.dispatch({
    effects: this.lineWrappingCompartment_.reconfigure(val ? window.CodeMirror.view.EditorView.lineWrapping : [])
  });
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
 * @param {window.CodeMirror.view.ViewUpdate} update
 */
EditorCodeMirror.prototype.onViewUpdate = function(update) {
  if (update.docChanged) {
    $.event.trigger('docchange');
  }
};

EditorCodeMirror.prototype.disable = function() {
  this.editorView_.dispatch({
    effects: this.editableCompartment_.reconfigure(window.CodeMirror.view.EditorView.editable.of(false))
  });
};

EditorCodeMirror.prototype.enable = function() {
  this.editorView_.dispatch({
    effects: this.editableCompartment_.reconfigure(window.CodeMirror.view.EditorView.editable.of(true))
  });
};
