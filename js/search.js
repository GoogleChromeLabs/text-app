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
  var content = this.cm_.getValue().toLowerCase();
  var query = query.toLowerCase();
  var resultsCount = 0;
  var pos=0;
  var step = query.length;
  while (true) {
    pos = content.indexOf(query, pos);
    if (pos >= 0) {
      resultsCount++;
      pos += step;
    } else {
      break;
    }
  }
  return resultsCount;
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
  this.index_ = 0;
  this.resultsCount_ = this.computeResultsCount_(query);

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

  if (!this.cursor_.find(reverse)) {
    var lastLine = CodeMirror.Pos(this.cm_.lastLine());
    var firstLine = CodeMirror.Pos(this.cm_.firstLine(), 0);
    this.cursor_ = this.updateCursor_(this.query_,
        reverse ? lastLine : firstLine);
    this.cursor_.find(reverse);
  }

  var from = this.cursor_.from();
  var to = this.cursor_.to();

  if (from && to) {
    this.cm_.setSelection(from, to);
    this.index_ += reverse ? -1 : 1;
    if (this.index_ === 0) {
      this.index_ = this.resultsCount_;
    } else if (this.index_ > this.resultsCount_) {
      this.index_ = 1;
    }
  } else {
    this.resetSelection_();
  }
};

/**
 * Unfocus search focus the editor.
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