/**
 * @constructor
 * @param {DOM} editorElement
 * @param {Settings} settings
 */
function EditorTextArea(editorElement, settings) {
  this.element_ = editorElement;
  this.settings_ = settings;
  this.numLines_ = 1;
  this.textareaPadding_ = 20;
  this.currentSession_ = null;
  this.dimentions = {
    height: null,
    width: null
  };
  const initFontSize = this.settings_.get('fontsize') + 'px';

  // We need a named reference to this arrow function so we can remove it
  // as an EventListener.
  this.onInput = () => {
    this.syncTextArea();
    this.onChange();
  }

  // Build up the text editor in js, we do this here and not in the html since
  // this is what codemirror does and we want to match it's interface as much
  // as possible to allow for a easy switching between the two.
  this.wrapper_ = document.createElement('div');
  this.wrapper_.classList.add('editor-textarea-wrapper');

  this.lineNumbers_ = document.createElement('div');
  this.lineNumbers_.setAttribute('id', 'editor-textarea-line-numbers');
  this.lineNumbers_.style.fontSize = initFontSize;
  this.lineNumbers_.appendChild(this.createLineElement(1));

  this.container_ = document.createElement('div');
  this.container_.classList.add('editor-textarea-container');
  this.container_.append(this.lineNumbers_);
  this.container_.append(this.wrapper_);

  this.containerResizeObserver_ = new ResizeObserver(() => {
    this.calibrateDimensions();
  });
  this.containerResizeObserver_.observe(this.container_);
  this.wrapperResizeObserver_ = new ResizeObserver(() => {
    this.calibrateDimensions();
  });
  this.wrapperResizeObserver_.observe(this.wrapper_);
  window.addEventListener('resize', () => {
    this.calibrateDimensions();
  });

  this.element_.appendChild(this.container_);

  // A hack which leverages a hidden div to figure out the height and width
  // the text area should be since text areas cannot grow with input
  // automatically.
  this.mirror_ = document.createElement('div');
  this.mirror_.classList.add('hidden-textarea-mirror');
  this.mirror_.style.fontSize = initFontSize;
  this.lineMirror_ = document.createElement('div');
  this.lineMirror_.classList.add('hidden-line-mirror');
  this.lineMirror_.style.fontSize = initFontSize;
  this.element_.appendChild(this.mirror_);
  this.element_.appendChild(this.lineMirror_);

  // The main text area the user will be interacting with.
  this.attachTextArea(document.createElement('textarea'));

  this.calibrateDimensions();
  this.setTheme();
  // TODO: set up search
  // TODO: setup how we are handling tab characters?
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
  textarea.style.fontSize = initFontSize;
  textarea.addEventListener('input', this.onInput);

  this.textarea_ = textarea;
  this.wrapper_.appendChild(this.textarea_ );
}

/**
 * Updates the various components of the editor when the window is resized.
 */
EditorTextArea.prototype.calibrateDimensions = function() {
  this.updateDimentions();

  if (this.settings_.get('wraplines')) {
    // Update the width of the line mirror so we can extract out
    // accurate heights.
    this.lineMirror_.style.width = this.dimentions.width + 'px';
    this.updateLineNumbers();
  }
  this.updateTextArea();
}

/**
 * Updates height for both line number gutter and textarea.
 * @param {number} height
 */
EditorTextArea.prototype.updateHeight = function(height) {
  this.wrapper_.style.height = height + 'px';
  // Annoyingly, we need to give the wrapper time to register it's height
  // change before updating the text area or the two elements overlap
  setTimeout(() => {
    this.textarea_.style.height = height + 'px';
  }, 0);

  this.lineNumbers_.style.height = height + 'px';
}

/**
 * Updates width for the textarea.
 * @param {number} width
 */
EditorTextArea.prototype.updateWidth = function(width) {
  this.textarea_.style.width = width + 'px';
}

/**
 * Create a div containing a line number for the gutter.
 * @param {number} number
 * @param {number} height
 * @return {HTMLElement}
 */
EditorTextArea.prototype.createLineElement = function(number, height) {
  const e = document.createElement('div');
  e.innerText = number;
  if (height !== undefined)
    e.style.height = height + 'px';
  // Else let css define the deafult height of the element.
  return e;
}

/**
 * Syncs the textareas width and height into the object for use in
 * calculations and updates the editor container to match the height of the
 * text area.
 */
EditorTextArea.prototype.updateDimentions = function() {
  const editorHeight = this.element_.getBoundingClientRect().height;
  this.dimentions.height = (editorHeight - this.textareaPadding_);
  this.dimentions.width = (this.wrapper_.getBoundingClientRect().width - this.textareaPadding_);

  // grow container to match the editor
  this.container_.style.height = (editorHeight) + 'px';
}

/**
 * Change the current session, usually to switch to another tab.
 * @param {SessionDescriptor} session
 */
EditorTextArea.prototype.setSession = function(session) {
  this.attachTextArea(session.textarea);
  this.syncTextArea();
  this.currentSession_ = session;
};

/**
 * Return search object.
 * @return {Search}
 */
EditorTextArea.prototype.getSearch = function() {
  // TODO(zafzal): this.
};

/**
 * Correct the text area's dimentions given it's content.
 * This is needed because a text area does not grow with it's input without
 * some javascript help.
 */
EditorTextArea.prototype.syncTextArea = function() {
  const text = this.textarea_.value;
  let count = 0;
  for(const c of text) {
    if (c === '\n')
      count++;
  }
  this.numLines_ = count + 1;
  let newMirrorText = this.textarea_.value;

  // The height of a div is based on the number of lines of inside of it, as
  // such text like `hello\nworld\n` registers as 2 lines and the height will
  // grow to encompass 2 lines of text. This is not what we want since the
  // trailing new line should render a empty line at the end. To fix this we
  // convert any line like `hello\nworld\n` to `hello\nworld\nA` which the div
  // will register as 3 lines and correctly encompass.
  if (this.textarea_.value[this.textarea_.value.length-1] === '\n') {
    newMirrorText += 'A';
  }

  this.mirror_.innerText = newMirrorText;
  this.updateLineNumbers();
  this.updateTextArea();
}

EditorTextArea.prototype.onChange = function() {
  $.event.trigger('docchange', {
    type: 'textarea',
    session: this.currentSession_
  });
};

EditorTextArea.prototype.updateTextArea = function() {
  const calculatedHeight = this.mirror_.getBoundingClientRect().height+4;
  const calculatedWidth = this.mirror_.getBoundingClientRect().width;
  // If the height is less then the window height just snap to the window
  // height.
  if (calculatedHeight < this.dimentions.height) {
    // this case is triggered when someone deletes all the text in a file
    // in this case snap the scroll to the top as well
    this.container_.scrollTop = 0;
    this.updateHeight(this.dimentions.height);
  } else {
    this.updateHeight(calculatedHeight);
  }

  // If lines are being wrapped just snap to window size else let the textarea grow
  // to be as long as the longest line (but have a minimum size).
  if (this.settings_.get('wraplines')) {
    this.updateWidth(this.dimentions.width);
  } else {
    this.updateWidth(Math.max(this.dimentions.width, calculatedWidth));
  }
};

EditorTextArea.prototype.updateLineNumbers = function() {
  const wrapLines = this.settings_.get('wraplines');
  if (wrapLines) {
    // If we are wrapping the lines we need to recompute the line heights
    // on any change.
    this.clearLineNumbers()
  }
  let linesRendered = this.lineNumbers_.children.length;

  // Remove excess elements.
  while (linesRendered > this.numLines_) {
    this.lineNumbers_.lastChild.remove();
    linesRendered--;
  }
  // Add missing elements.
  while(linesRendered < this.numLines_) {
    const line = linesRendered + 1;
    // If word wrap is on we have to additionally set height.
    const height = wrapLines ? this.getLineHeight(line) : undefined;
    this.lineNumbers_.appendChild(this.createLineElement(line, height));
    linesRendered++;
  }

};

EditorTextArea.prototype.getLineHeight = function(lineNumber) {
  // TODO(zafzal): Speed this up, splitting the whole doc is a bottleneck
  let line = this.textarea_.value.split('\n')[lineNumber-1];
  // An empty string will have 0 height.
  if (line === '')
    line = 'A';
  this.lineMirror_.innerText = line;
  return this.lineMirror_.getBoundingClientRect().height;
}

/**
 * Clears the line numbers in the gutter so they can be repopulated.
 */
EditorTextArea.prototype.clearLineNumbers = function() {
  while (this.lineNumbers_.lastChild)
    this.lineNumbers_.lastChild.remove();
}

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
 * Set the syntac highlighting mode of the text editor
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
  // TODO(zafzal): this.
  // TODO(zafzal): think about how to indicate that a tab is not "tab" but "shift tab".
};

/**
 * @param {string} theme
 */
EditorTextArea.prototype.setTheme = function() {
  if (this.settings_.get('theme') === 'dark') {
    this.container_.classList.add('dark-theme');
  } else {
    this.container_.classList.remove('dark-theme');
  }
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.showHideLineNumbers = function(val) {
  // TODO(zafzal): this.
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.setWrapLines = function(val) {
  // of the wrap lines setting has changed at all we need to recompute line no.
  this.clearLineNumbers();

  // update the text area and line numbers to match the new view
  this.updateTextArea();
  this.updateLineNumbers();
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.setSmartIndent = function(val) {
  // TODO(zafzal): this.
  // TODO(zafzal): disable this on the UI when accessibility mode is active.
};

/**
 * @param {boolean} val
 */
EditorTextArea.prototype.replaceTabWithSpaces = function(val) {
  // TODO(zafzal): this.
};

/**
 * Make the textarea unfocusable and hide cursor.
 */
EditorTextArea.prototype.disable = function() {
  // TODO(zafzal): this.
};

/**
 * Focus textarea again
 */
EditorTextArea.prototype.enable = function() {
  // TODO(zafzal): this.
};

/**
 * Prepare the Editor to be killed and removed from the DOM.
 */
EditorTextArea.prototype.destory = function() {
  this.containerResizeObserver_.disconnect();
  this.wrapperResizeObserver_.disconnect();
  window.removeEventListener('resize', () => {
    this.calibrateDimensions();
  });
};
