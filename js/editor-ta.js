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

  // The main text area the user will be interacting with
  this.textarea_ = document.createElement('textarea');
  this.textarea_.setAttribute('id', 'editor-ta');
  this.textarea_.style.fontSize = initFontSize;
  this.textarea_.addEventListener('input', function() {
    this.onChange();
  }.bind(this));
  window.addEventListener('resize', function() {
    this.onResize();
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

  this.containerResizeObserver_ = new ResizeObserver(function() {
    this.onResize();
  }.bind(this)).observe(this.container_);

  this.element_.appendChild(this.container_);

  // A hack which leverages a hidden div to figure out the height and width
  // the text area should be since text areas can not grow with input
  // automatically
  this.mirror_ = document.createElement('div');
  this.mirror_.classList.add('hidden');
  this.mirror_.style.fontSize = initFontSize;
  this.lineMirror_ = document.createElement('div');
  this.lineMirror_.classList.add('hidden');
  this.lineMirror_.style.fontSize = initFontSize;
  this.element_.appendChild(this.mirror_);
  this.element_.appendChild(this.lineMirror_);

  this.onResize();

  // TODO: set up search
  // TODO: setup how we are handling tabs?

}

/**
 * Updates the various components of the editor when the window is resized
 */
EditorTextArea.prototype.onResize = function() {
  this.updateInitDimentions();

  // If we have word wrap on we need to regen the line numbers
  if (this.settings_.get('wordwrap')) {
    // TODO(zafzal): replace this with a proper remove all children
    this.lineNumbers_.innerHTML = '';

    // Update the width of the line mirror so we can extract out
    // accurate heights
    this.lineMirror_.style.width = this.initWidth_ + 'px';
  }

  this.updateLineNumbers();
  this.updateTextArea();
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
 * @param {number} width
 * Updates width for the textarea
 */
EditorTextArea.prototype.updateWidth = function(width) {
  this.textarea_.style.width = width + 'px';
}

/**
 * @param {number} number
 * @param {number} height
 * @return {HTMLElement}
 * Create a span for the line number gutter containing the line number
 */
EditorTextArea.prototype.lineNumberElem = function(number, height) {
  const e = document.createElement('div');
  e.innerText = number;
  if (height !== undefined)
    e.style.height = height + 'px';
  return e;
}

EditorTextArea.prototype.updateInitDimentions = function() {
  // the -/+ 8 is to account for padding
  this.initHeight_ = this.element_.getBoundingClientRect().height - 8;
  this.container_.style.height = (this.initHeight_ + 8) + 'px';
  this.initWidth_ = this.wrapper_.getBoundingClientRect().width - 8;
}

/**
 * @param {string} opt_content
 * @return {EditSession}
 * Create an edit session for a new file. Each tab should have its own session.
 */
EditorTextArea.prototype.newSession = function(opt_content) {
  // TODO(zafzal): this
  // Note opt_content is inital content to load into the area, remember to
  // update the this.numLines_ and stuff;
  // maybe just called updateLineNumbers and updateTextArea}
};

/**
 * @param {EditSession} session
 * Change the current session, usually to switch to another tab.
 */
EditorTextArea.prototype.setSession = function(session) {
  // TODO(zafzal): this
  // Note when switching out content remember to update the this.numLines_ and stuff;
  // maybe just called updateLineNumbers and updateTextArea
};

/**
 * @return {Search}
 * Return search object.
 */
EditorTextArea.prototype.getSearch = function() {
  // TODO(zafzal): this
};

EditorTextArea.prototype.onChange = function() {
  // TODO(zafzal): Speed this up
  this.numLines_ = this.textarea_.value.split('').filter(x => x === '\n').length + 1;
  this.mirror_.innerText = this.textarea_.value;

  // If we have a blank line at the end we have to add a character to get the
  // height to set correctly
  if (this.textarea_.value[this.textarea_.value.length-1] === '\n') {
    this.mirror_.innerText += 'A';
  }
  this.updateLineNumbers();
  this.updateTextArea();
  // TODO(zafzal): need to emit a docChange event to each tab can know a change occured...
};

EditorTextArea.prototype.updateTextArea = function() {
  const calculatedHeight = this.mirror_.getBoundingClientRect().height;
  const calculatedWidth = this.mirror_.getBoundingClientRect().width;
  // if the height is less then the window height just snap to the window height
  if (calculatedHeight < this.initHeight_) {
    this.container_.scrollTop = 0;
    this.updateHeight(this.initHeight_);
  } else {
    this.updateHeight(calculatedHeight);
  }

  if (this.settings_.get('wraplines')) {
    this.updateWidth(this.initWidth_);
  } else {
    this.updateWidth(Math.max(this.initWidth_, calculatedWidth));
  }

};


EditorTextArea.prototype.updateLineNumbers = function() {
  let linesRendered = this.lineNumbers_.children.length;

  // remove excess elements
  while (linesRendered > this.numLines_) {
    this.lineNumbers_.lastChild.remove();
    linesRendered--;
  }
  // add missing elements
  while(linesRendered < this.numLines_) {
    const line = linesRendered + 1;
    // If word wrap is on we have to additionally set height
    const height = this.settings_.get('wordwrap') ? this.getLineHeight(line) : undefined;
    this.lineNumbers_.appendChild(this.lineNumberElem(line, height));
    linesRendered++;
  }

};

EditorTextArea.prototype.getLineHeight = function(lineNumber) {
  // TODO(zafzal): Speed this up, splitting the whole doc is a bottleneck
  const line = this.textarea_.value.split('\n')[lineNumber-1];
  this.lineMirror_.innerText = line;
  return this.lineMirror_.getBoundingClientRect().height;
}

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
  // textarea does not support any modes other then plain text :(
};

/**
 * @param {number} fontSize
 * Update font size from settings.
 */
EditorTextArea.prototype.setFontSize = function(fontSize) {
  this.textarea_.style.fontSize = fontSize + 'px';
  this.lineNumbers_.style.fontSize = fontSize + 'px';
  this.mirror_.style.fontSize = fontSize + 'px';
  this.lineMirror_.style.fontSize = fontSize + 'px';
  this.updateLineNumbers();
  this.updateTextArea();
};

/**
 * @param {number} size
 */
EditorTextArea.prototype.setTabSize = function(size) {
  // TODO(zafzal): this
  // TODO(zafzal): think about how to indicate that a tab is not "tab" but "shift tab"
};

/**
 * @param {string} theme
 */
EditorTextArea.prototype.setTheme = function(theme) {
  // TODO(zafzal): this
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.showHideLineNumbers = function(val) {
  // TODO(zafzal): this
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.setWrapLines = function(val) {
  // just update the text area which will check the relevent settings item
  this.updateTextArea();
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.setSmartIndent = function(val) {
  // TODO(zafzal): this
  // TODO(zafzal): disable this on the UI when accessibility mode is active
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.replaceTabWithSpaces = function(val) {
  // TODO(zafzal): this
};

/**
 * Make the textarea unfocusable and hide cursor.
 */
EditorTextArea.prototype.disable = function() {
  // TODO(zafzal): this
};

/**
 * Focus textarea again
 */
EditorTextArea.prototype.enable = function() {
  // TODO(zafzal): this
};
