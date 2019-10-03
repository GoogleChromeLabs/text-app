/**
 * @constructor
 * @param {DOM} elementId
 * @param {Settings} settings
 */
function EditorTextArea(editorElement, settings) {
  this.element_ = editorElement;
  this.settings_ = settings;
  this.setTheme();

  this.element_.innerText = 'HELLO I AM A EDITOR';

  // TODO: set up search
  // TODO: setup how we are handling tabs?

}


/**
 * @param {string} opt_content
 * @return {EditSession}
 * Create an edit session for a new file. Each tab should have its own session.
 */
EditorTextArea.prototype.newSession = function(opt_content) {
  // TODO: this
};

/**
 * @param {EditSession} session
 * Change the current session, usually to switch to another tab.
 */
EditorTextArea.prototype.setSession = function(session) {
  // TODO: this
};

/**
 * @return {Search}
 * Return search object.
 */
EditorTextArea.prototype.getSearch = function() {
  // TODO: this
};

EditorTextArea.prototype.onChange = function() {
  // TODO: this
};

EditorTextArea.prototype.undo = function() {
  // This is handled by the text area defaults
};

EditorTextArea.prototype.redo = function() {
  // This is handled by the text area defaults
};

EditorTextArea.prototype.focus = function() {
  // TODO: this
};

/**
 * @param {Session} session
 * @param {string} extension
 */
EditorTextArea.prototype.setMode = function(session, extension) {
  // textarea does not support any modes other then plain text
};

/**
 * @param {number} fontSize
 * Update font size from settings.
 */
EditorTextArea.prototype.setFontSize = function(fontSize) {

};

/**
 * @param {number} size
 */
EditorTextArea.prototype.setTabSize = function(size) {
  // TODO: this
  // TODO: think about how to indicate that a tab is not "tab" but "shift tab"
};

/**
 * @param {string} theme
 */
EditorTextArea.prototype.setTheme = function(theme) {
  // TODO: this
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.showHideLineNumbers = function(val) {
  // TODO: this
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.setWrapLines = function(val) {
  // TODO: this
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.setSmartIndent = function(val) {
  // TODO: this
  // TODO: disable this on the UI when accessibility mode is active
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.replaceTabWithSpaces = function(val) {
  // TODO: this
};

/**
 * Make the textarea unfocusable and hide cursor.
 */
EditorTextArea.prototype.disable = function() {
  // TODO: this
};

/**
 * Focus textarea again
 */
EditorTextArea.prototype.enable = function() {
  // TODO: this
};

