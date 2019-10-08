/**
 * @constructor
 * @param {DOM} elementId
 * @param {Settings} settings
 */
function EditorTextArea(editorElement, settings) {
  this.element_ = editorElement;
  this.settings_ = settings;
  this.numLines_ = 1;

  this.setTheme();

  const initFontSize = this.settings_.get('fontsize') + 'px';

  this.textarea_ = document.createElement('textarea');
  this.textarea_.setAttribute('id', 'editor-ta');
  this.textarea_.style.fontSize = initFontSize;
  this.textarea_.addEventListener('input', function() {
    this.onChange();
  }.bind(this));
  window.addEventListener('resize', function() {
    this.updateInitHeight();
    this.updateLineNumbers();
    this.updateTextArea();
  }.bind(this));

  this.wrapper_ = document.createElement('div');
  this.wrapper_.classList.add('editor-ta-wrapper');
  this.wrapper_.appendChild(this.textarea_);

  this.lineNumbers_ = document.createElement('div');
  this.lineNumbers_.setAttribute('id', 'editor-ta-line-numbers');
  this.lineNumbers_.style.fontSize = initFontSize;
  this.lineNumbers_.appendChild(this.lineNumberElem(1));

  this.container_ = document.createElement('div');
  this.container_.classList.add('editor-ta-container');
  this.container_.append(this.lineNumbers_);
  this.container_.append(this.wrapper_);

  this.element_.appendChild(this.container_);

  // Hack to be able to grow the textarea to it's input.
  // - 8 to compenstate for padding
  this.updateInitHeight();
  this.mirror_ = document.createElement('div');
  this.mirror_.classList.add('hidden');
  this.mirror_.style.fontSize = initFontSize;
  this.element_.appendChild(this.mirror_);

  this.updateHeight(this.initHeight_);
  // container should match editor so undo the padding change
  // TODO: set up search
  // TODO: setup how we are handling tabs?

}

/**
 * @param {number} height
 * Updates height for both line number and container elem
 */
EditorTextArea.prototype.updateHeight = function(height) {
  this.textarea_.style.height = height + 'px';
  this.wrapper_.style.height = height + 'px';
  this.lineNumbers_.style.height = height + 'px';
}


/**
 * @param {number} number
 * @return {HTMLElement}
 * Create a span for the line number gutter containing the line number
 */
EditorTextArea.prototype.lineNumberElem = function(number) {
  const e = document.createElement('div');
  e.innerText = number;
  return e;
}

EditorTextArea.prototype.updateInitHeight = function() {
  this.initHeight_ = this.element_.getBoundingClientRect().height - 8;
  this.container_.style.height = (this.initHeight_ + 8) + 'px';
}

/**
 * @param {string} opt_content
 * @return {EditSession}
 * Create an edit session for a new file. Each tab should have its own session.
 */
EditorTextArea.prototype.newSession = function(opt_content) {
  // TODO: this
  // Note opt_content is inital content to load into the area, remember to
  // update the this.numLines_ and stuff;
  // maybe just called updateLineNumbers and updateTextArea}
};

/**
 * @param {EditSession} session
 * Change the current session, usually to switch to another tab.
 */
EditorTextArea.prototype.setSession = function(session) {
  // TODO: this
  // Note when switching out content remember to update the this.numLines_ and stuff;
  // maybe just called updateLineNumbers and updateTextArea
};

/**
 * @return {Search}
 * Return search object.
 */
EditorTextArea.prototype.getSearch = function() {
  // TODO: this
};

EditorTextArea.prototype.onChange = function() {
  this.numLines_ = this.textarea_.value.split('').filter(x => x === '\n').length + 1;
  this.mirror_.innerText = this.textarea_.value;
  // If we have a blank line at the end we have to add a character to get the
  // height to set correctly
  if (this.textarea_.value[this.textarea_.value.length-1] === '\n') {
    this.mirror_.innerText += 'A';
  }
  this.updateLineNumbers();
  this.updateTextArea();
  // TODO: need to emit a docChange event to each tab can know a change occured...
};

EditorTextArea.prototype.updateTextArea = function() {
  const calculatedHeight = this.mirror_.getBoundingClientRect().height;
  // TODO(zafzal): adjust for padding.
  if (calculatedHeight < this.initHeight_) {
    this.container_.scrollTop = 0;
    this.updateHeight(this.initHeight_);
    return;
  }
  this.updateHeight(calculatedHeight);
};


EditorTextArea.prototype.updateLineNumbers = function() {
  let linesRendered = this.lineNumbers_.children.length;

  // remove excess
  while (linesRendered > this.numLines_) {
    this.lineNumbers_.lastChild.remove();
    linesRendered--;
  }
  // add missing
  while(linesRendered < this.numLines_) {
    this.lineNumbers_.appendChild(this.lineNumberElem(linesRendered+1));
    linesRendered++;
  }

};

EditorTextArea.prototype.undo = function() {
  // This is handled by the text area defaults
};

EditorTextArea.prototype.redo = function() {
  // This is handled by the text area defaults
};

EditorTextArea.prototype.focus = function() {
  this.textarea_.focus();
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
  this.textarea_.style.fontSize = fontSize + 'px';
  this.lineNumbers_.style.fontSize = fontSize + 'px';
  this.mirror_.style.fontSize = fontSize + 'px';
  this.updateLineNumbers();
  this.updateTextArea();
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
