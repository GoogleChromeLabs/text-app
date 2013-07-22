var EditSession = CodeMirror.Doc;

/**
 * @constructor
 * @param {string} elementId
 * @param {Settings} settings
 */
function EditorCodeMirror(elementId, settings) {
  this.elementId_ = elementId;
  this.settings_ = settings;
  this.cm_ = CodeMirror(document.getElementById(elementId));

  $(document).bind('settingschange', this.onSettingsChanged_.bind(this));

  this.setTheme();
}

/**
 * @param {string} opt_content
 * @return {EditSession}
 * Create an edit session for a new file. Each tab should have its own session.
 */
EditorCodeMirror.prototype.newSession = function(opt_content) {
  var session = new CodeMirror.Doc(opt_content | '');
  return session;
};
/**
 * @param {EditSession} session
 * Change the current session, e.g. to edit another tab.
 */
EditorCodeMirror.prototype.setSession = function(session) {
  this.cm_.swapDoc(session);
};

EditorCodeMirror.prototype.find = function(string) {
};

EditorCodeMirror.prototype.findNext = function() {
};

EditorCodeMirror.prototype.clearSearch = function() {
};

EditorCodeMirror.prototype.onChange = function(e) {
};

EditorCodeMirror.prototype.undo = function() {
};

EditorCodeMirror.prototype.redo = function() {
};

EditorCodeMirror.prototype.focus = function() {
};

/**
 * @param {Session} session
 * @param {string} extension
 */
EditorCodeMirror.prototype.setMode = function(session, extension) {
};

/**
 * The actual changing of the font size will be triggered by settings change
 * event.
 */
EditorCodeMirror.prototype.increaseFontSize = function() {
};

/**
 * The actual changing of the font size will be triggered by settings change
 * event.
 */
EditorCodeMirror.prototype.decreseFontSize = function() {
};

/**
 * @param {number} fontSize
 * Update font size from settings.
 */
EditorCodeMirror.prototype.setFontSize = function(fontSize) {
};

/**
 * @param {EditSession} session
 * @return {string}
 */
EditorCodeMirror.prototype.getContents = function(session) {
};

/**
 * @param {EditSession} session
 * @param {number} size
 */
EditorCodeMirror.prototype.setTabSize = function(session, size) {
};


/**
 * @param {string} theme
 */
EditorCodeMirror.prototype.setTheme = function() {
  var theme = this.settings_.get('theme');
  $('body').attr('theme', theme);
};

/**
 * @param {Event} e
 * @param {string} key
 * @param {*} value
 */
EditorCodeMirror.prototype.onSettingsChanged_ = function(e, key, value) {
  switch (key) {
    case 'theme':
      this.setTheme();
      break;
  }
};

var Editor = EditorCodeMirror;

