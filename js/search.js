/**
 * @constructor
 * @param {CodeMirror} cm CodeMirror object.
 */
function Search(cm) {
  this.cm_ = cm;
  this.cursor_ = null; /* SearchCursor object from CodeMirror */
  this.query_ = null;
  this.index_ = 0;
  this.resultsCount_ = 0;
};

/**
 * @param {string} query
 * @param {CodeMirror.Pos} pos
 * Get a search cursor that is always case insensitive.
 */
Search.prototype.updateCursor_ = function(query, pos) {
  return this.cm_.getSearchCursor(query, pos, true /* case insensitive */);
};


/**
 * @param {string} query
 * @return {integer}
 * Get results count for a query search.
 */
Search.prototype.computeResultsCount_ = function(query) {
  query = query.toLowerCase();
  this.index_ = 0;
  this.resultsCount_ = 0;
  var cursorLine = this.cursor_.pos.from.line;
  var cursorCh = this.cursor_.pos.from.ch;
  var step = query.length;

  this.cm_.eachLine(function(line) {
    var content = line.text.toLowerCase();
    var lineNo = line.lineNo();
    var pos = 0;
    while (true) {
      pos = content.indexOf(query, pos);
      if (pos >= 0) {
        this.resultsCount_++;
        if ((lineNo < cursorLine) || (lineNo == cursorLine && pos < cursorCh)) {
          this.index_++;
        }
        pos += step;
      } else {
        break;
      }
    }
  }.bind(this));
};

/**
 * Reset selection.
 */
Search.prototype.resetSelection_ = function() {
  this.cm_.setCursor(this.cm_.getCursor('anchor'));
};

/**
 * Clear search.
 */
Search.prototype.clear = function() {
  this.query_ = null;
  this.cursor_ = null;
  this.resetSelection_();
};

/**
 * @return {integer}
 * Return current search index.
 */
Search.prototype.getCurrentIndex = function() {
  return this.index_;
};

/**
 * @return {integer}
 * Return total search results.
 */
Search.prototype.getResultsCount = function() {
  return this.resultsCount_;
};

/**
 * @param {string} query
 * Initialize search. This is called every time the search string is updated.
 */
Search.prototype.find = function(query) {
  this.query_ = query;

  // If there is no selection, we start at cursor. If there is, we start at the
  // beginning of it.
  var currentPos = this.cm_.getCursor('start');

  this.cursor_ = this.updateCursor_(query, currentPos);
  this.computeResultsCount_(query);

  // Actually go to the match.
  this.findNext();
};

/**
 * @param {boolean} opt_reverse
 * Select the next match when user presses Enter in search field or clicks on
 * "Next" and "Previous" search navigation buttons.
 */
Search.prototype.findNext = function(opt_reverse) {
  if (!this.cursor_) {
    throw 'Internal error: cursor should be initialized.';
  }
  var reverse = opt_reverse || false;
  var isFound = this.cursor_.find(reverse);
  if (!isFound) {
    var lastLine = CodeMirror.Pos(this.cm_.lastLine());
    var firstLine = CodeMirror.Pos(this.cm_.firstLine(), 0);
    this.cursor_ = this.updateCursor_(this.query_,
        reverse ? lastLine : firstLine);
    isFound = this.cursor_.find(reverse);
  }

  if (isFound) {
    this.cm_.setSelection(this.cursor_.from(), this.cursor_.to());
    this.index_ += reverse ? -1 : 1;
    this.index_ = this.index_ % this.resultsCount_;
    if (this.index_ == 0) {
      this.index_ = this.resultsCount_;
    }
  } else {
    this.resetSelection_();
  }
};

/**
 * Get current search query.
 */
Search.prototype.getQuery = function() {
  return this.query_;
};

/**
 * Unfocus search focus the editor.
 */
Search.prototype.unfocus = function() {
  this.cm_.focus();
};