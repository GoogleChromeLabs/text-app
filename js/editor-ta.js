/**
 * @constructor
 * @param {DOM} editorElement
 * @param {Settings} settings
 */
function EditorTextArea(editorElement, settings) {
  this.element_ = editorElement;
  this.settings_ = settings;
  this.numLines_ = 1;
  this.verticalTextareaPadding_ = 20;
  this.horizontalTextareaPadding_ = 8;
  this.currentSession_ = null;
  this.dimentions = {
    height: null,
    width: null
  };
  this.characterDimentions_ = {
    height: null,
    width: null
  };
  this.lineHeightCache = [];
  this.longestLine_ = 0;
  const initFontSize = this.settings_.get('fontsize') + 'px';
  this.totalCalculatedHeight_ = null;
  // We need a named reference to these arrow functions so we can remove them
  // as EventListeners.
  this.onInput = () => {
    this.syncTextArea();
    this.onChange();
  }
  this.onKeydown = (e) => {
    // control-shift-z should trigger a redo
    if (e.ctrlkey && e.shift && e.key === "e") {
      this.redo();
    }
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

  // We can calculate how much space a line takes up as long as we know the size
  // of one character. Sadly 1 character doesn't seem to have a neat
  // relationship with font size so this div is used to get the size of a
  // character at the current font size to be used in calculations.
  this.characterSizer_ = document.createElement('div');
  this.characterSizer_.classList.add('hidden-character-sizer');
  this.characterSizer_.style.fontSize = initFontSize;
  this.characterSizer_.innerText = 'A';
  this.element_.appendChild(this.characterSizer_);

  // The main text area the user will be interacting with.
  this.attachTextArea(document.createElement('textarea'));

  this.syncCharacterDimentions();
  this.calibrateDimensions();
  this.setTheme();
  // TODO: set up search
  // TODO: setup how we are handling tab characters?
}

/**
 * Updates the current understanding of how big a single character in the
 * textarea is.
 */
EditorTextArea.prototype.syncCharacterDimentions = function() {
  const fontSize = this.settings_.get('fontsize') + 'px';
  this.characterSizer_.style.fontSize = fontSize;
  const characterBoundingRect = this.characterSizer_.getBoundingClientRect();
  this.characterDimentions_.width = characterBoundingRect.width;
  this.characterDimentions_.height = characterBoundingRect.height;
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
    this.textarea_.removeEventListener('keydown', this.onKeydown);
  }

  textarea.setAttribute('id', 'editor-textarea');
  textarea.setAttribute('spellcheck', 'false');
  textarea.style.fontSize = initFontSize;
  textarea.addEventListener('input', this.onInput);
  textarea.addEventListener('input', this.onKeydown);

  this.textarea_ = textarea;
  this.wrapper_.appendChild(this.textarea_ );
}

/**
 * Updates the various components of the editor when the window is resized.
 */
EditorTextArea.prototype.calibrateDimensions = function() {
  this.updateDimentions();

  if (this.settings_.get('wraplines')) {
    this.syncTextArea();
  }
  this.updateLineNumbers();
  this.updateTextArea();
}

/**
 * Updates height for both line number gutter and textarea.
 * @param {number} height
 */
EditorTextArea.prototype.updateHeight = function(height) {
  this.wrapper_.style.height = height + 'px';
  // Annoyingly, we need to give the wrapper time to register it's height
  // change before updating the text area or the two elements overlap.
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
  // Else let css define the default height of the element.
  return e;
}

/**
 * Syncs the textareas width and height into the object for use in
 * calculations and updates the editor container to match the height of the
 * text area.
 */
EditorTextArea.prototype.updateDimentions = function() {
  const editorHeight = this.element_.getBoundingClientRect().height;
  this.dimentions.height = (editorHeight - this.verticalTextareaPadding_);
  this.dimentions.width = (this.wrapper_.getBoundingClientRect().width
    - this.horizontalTextareaPadding_);

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
 * Updates the line cache, line number, calculated height and longest line
 * variables with the provided text as the reference text.
 */
EditorTextArea.prototype.updateLineInfo = function(text) {
  let count = 0;
  let total = 0;
  let longestLine = 0;
  for (const line of text.split('\n')) {
    this.lineHeightCache[count] = this.getLineHeight(line);
    if (line.length > longestLine) {
      longestLine = line.length;
    }
    total += this.lineHeightCache[count];
    count++;
  }
  this.longestLine_ = longestLine;

  this.numLines_ = count;
  this.totalCalculatedHeight_ = total;
}

/**
 * Correct the text area's dimentions given it's content.
 * This is needed because a text area does not grow with it's input without
 * some javascript help.
 */
EditorTextArea.prototype.syncTextArea = function() {
  const text = this.textarea_.value;
  const prevNumLines = this.numLines_;

  this.updateLineInfo(text);
  this.updateLineNumbers();
  this.updateTextArea();

  // If the magnitutde of the line number has changed it means the sidebar has
  // a different width, i.e 10 vs 100.
  if (Math.floor(Math.log10(this.numLines_)) != Math.floor(Math.log10(prevNumLines))) {
    this.updateDimentions();
    this.updateLineInfo(text);
  }

}

EditorTextArea.prototype.onChange = function() {
  $.event.trigger('docchange', {
    type: 'textarea',
    session: this.currentSession_
  });
};

EditorTextArea.prototype.getTotalHeight = function() {
  return this.totalCalculatedHeight_;
};

EditorTextArea.prototype.getTotalWidth = function() {
  if (this.settings_.get('wraplines')) {
    return this.dimentions.width;
  } else {
    return this.characterDimentions_.width * this.longestLine_;
  }
}

EditorTextArea.prototype.getLineHeight = function(line) {
  const charWidth = this.characterDimentions_.width;
  const charHeight = this.characterDimentions_.height;
  if (!this.settings_.get('wraplines')) {
    return charHeight;
  }
  // This line box filling algorithm defines how big a line will be by
  // determining the points at which the line will break. This is at a
  // whitespace character, in the middle of a word if it's the only word on the
  // line or at a line break suggestion character (see below).
  // https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens#Suggesting_line_break_opportunities
  const words = [];
  const tokens = line.split(/\s/);
  let i = 0;
  for (let token of tokens) {
    if (/[-\u00AD]/.test(token)) {
      // Split a word with a line break suggestion character into chunks so each
      // component can correctly wrap.
      const suggestedChunks = token.split(/[-\u00AD]/);
      let i = 0;
      for (word of suggestedChunks) {
        if (i < suggestedChunks.length-1) {
          word += '-';
        }
        words.push(word);
        i++;
      }
    } else if (token.length > 0) {
      // If we are not at the end, add in the trailing space to the word.
      if (i < tokens.length - 1) {
        token += ' ';
      }
      words.push(token);
    } else {
      // If we have a empty string it means we split on 2 white space chars
      if (i < tokens.length - 1) {
        words.push(' ');
      }
    }
    i++;
  }

  let lines = 1;

  let width = this.dimentions.width;
  let wordLength = 0;
  while (words.length > 0 || wordLength !== 0) {
    if (wordLength === 0) {
      // Grab a new word to place.
      wordLength = words.shift(0).length*charWidth;
    }

    if (width - wordLength < 1 && width !== this.dimentions.width) {
      // We need to wrap this word to a new line.
      width = this.dimentions.width;
      lines++;
    } else if (width - wordLength < 0) {
      // This is the only word on the line, break the word itself.
      lines++;
      wordLength -= width;
    } else {
      width -= wordLength;
      wordLength = 0;
    }
  }
  return lines * charHeight;
}

EditorTextArea.prototype.updateTextArea = function() {
  const calculatedHeight = this.getTotalHeight();
  const calculatedWidth = this.getTotalWidth();

  // If the height is less then the window height just snap to the window
  // height.
  if (calculatedHeight < this.dimentions.height) {
    // In this case snap the scroll to the top as well in case the user deleted
    // a large chunk of text.
    this.container_.scrollTop = 0;
    this.updateHeight(this.dimentions.height);
  } else {
    this.updateHeight(calculatedHeight);
  }

  // The minium width of the textarea is the window size.
  this.updateWidth(Math.max(this.dimentions.width, calculatedWidth));
};

EditorTextArea.prototype.updateLineNumbers = function() {
  const wrapLines = this.settings_.get('wraplines');
  let linesRendered = this.lineNumbers_.children.length;

  // Update any existing elements if word wrap is on, as line heights may change
  if (wrapLines) {
    let i = 0;
    for (const child of this.lineNumbers_.children) {
      child.style.height = this.lineHeightCache[i]+'px';
      i++;
    }
  }

  // Remove excess elements.
  while (linesRendered > this.numLines_) {
    this.lineNumbers_.lastChild.remove();
    linesRendered--;
  }

  // Add missing elements.
  while(linesRendered < this.numLines_) {
    const height = this.lineHeightCache[linesRendered];
    this.lineNumbers_.appendChild(
      this.createLineElement(linesRendered + 1, height));
    linesRendered++;
  }

};

EditorTextArea.prototype.undo = function() {
  // This is handled by the text area defaults.
};

EditorTextArea.prototype.redo = function() {
  // This is handled by the text area defaults but we also want to trigger a
  // redo from control-shift-z to match codemirror behavior.
  document.execCommand('redo', false, null);
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

  this.syncCharacterDimentions();
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
