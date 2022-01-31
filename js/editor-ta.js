/**
 * @constructor
 * @param {DOM} editorElement
 * @param {Settings} settings
 */
function EditorTextArea(editorElement, settings) {
  this.root_ = editorElement;
  this.settings_ = settings;
  this.currentSession_ = null;

  // We need a named reference to this arrow function so we can remove it
  // as an EventListener.
  this.onInput = () => {
    this.onChange();
  }

  this.attachTextArea(document.createElement('textarea'));
  this.setTheme(settings.get('theme'));
}

/**
 * @param {HTMLElement} textarea
 * Attaches a given textarea to the editor so it may be edited.
 */
EditorTextArea.prototype.attachTextArea = function(textarea) {
  const initFontSize = this.settings_.get('fontsize') + 'px';
  // Detach previous text area.
  if (this.textarea_) {
    this.textarea_.remove();
    this.textarea_.removeEventListener('input', this.onInput);
  }

  textarea.setAttribute('id', 'editor-textarea');
  textarea.setAttribute('spellcheck', 'false');
  textarea.style.fontSize = initFontSize;
  textarea.addEventListener('input', this.onInput);

  this.textarea_ = textarea;
  this.root_.appendChild(this.textarea_ );
}

/**
 * Change the current session, usually to switch to another tab.
 * @param {SessionDescriptor} session
 */
EditorTextArea.prototype.setSession = function(session) {
  this.attachTextArea(session.textarea);
  this.currentSession_ = session;
};

/**
 * Returns all settings which are locked to a certain value
 * when this editor is open.
 */
EditorTextArea.prototype.lockedSettings = function() {
  return {
    'linenumbers': false,
    'smartindent': false,
    'spacestab': false,
    'tabsize': 3,
    'wraplines': true,
    'search': false
  }
};

/**
 * Return search object.
 * @return {Search}
 */
EditorTextArea.prototype.getSearch = function() {
  // Unsupported.
};


EditorTextArea.prototype.onChange = function() {
  $.event.trigger('docchange', {
    type: 'textarea',
    session: this.currentSession_
  });
};

EditorTextArea.prototype.undo = function() {
  // This is handled by the text area defaults.
};

EditorTextArea.prototype.redo = function() {
  // This is handled by the text area defaults.
};

EditorTextArea.prototype.focus = function() {
  this.textarea_.focus();
};

/**
 * Set the syntax highlighting mode of the text editor.
 * @param {Session} session
 * @param {string} extension
 */
EditorTextArea.prototype.setMode = function(session, extension) {
  // Textarea does not support any modes other than plain text.
};

/**
 * Update font size from settings.
 * @param {number} fontSize
 */
EditorTextArea.prototype.setFontSize = function(fontSize) {
  this.textarea_.style.fontSize = fontSize + 'px';
};

/**
 * @param {number} size
 */
EditorTextArea.prototype.setTabSize = function(size) {
  // Unsupported.
};

/**
 * @param {string} theme The color theme to change to. Default light.
 */
EditorTextArea.prototype.setTheme = function(theme) {
  if (theme === 'dark') {
    this.root_.classList.add('dark-theme');
  } else {
    this.root_.classList.remove('dark-theme');
  }
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.showHideLineNumbers = function(val) {
  // Unsupported.
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.setWrapLines = function(val) {
  // Unsupported.
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.setSmartIndent = function(val) {
  // Unsupported.
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.replaceTabWithSpaces = function(val) {
  // Unsupported.
};

EditorTextArea.prototype.disable = function() {
  // Unsupported.
};

EditorTextArea.prototype.enable = function() {
  // Unsupported.
};

/**
 * Prepare the Editor to be killed and then remove it from the DOM.
 */
EditorTextArea.prototype.destroy = function() {
  // Text area does not have any destruction logic.
};
