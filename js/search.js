/**
 * @constructor
 * @param {EditorView} editorView
 */
function Search(editorView) {
  this.editorView_ = editorView;
  this.query_ = null;
  this.index_ = 0;
  this.resultsCount_ = 0;
};


/**
 * @param {string} query
 * Compute resultsCount_ and index_.
 */
Search.prototype.computeResultsCount_ = function(query) {
  query = query.toLowerCase();
  this.index_ = 0;
  this.resultsCount_ = 0;
  var cursor = this.editorView_.state.selection.main.from;

  let text = this.editorView_.state.doc;
  let search = new CodeMirror.search.SearchCursor(
    text, query, 0, text.length, (s) => s.toLowerCase());

  for (let value of search) {
    this.resultsCount_++;
    if (value.from < cursor) {
      this.index_++;
    }
  }
};

/**
 * Reset selection.
 */
Search.prototype.resetSelection_ = function() {
  // XXX set selection to the anchor
};

/**
 * Clear search.
 */
Search.prototype.clear = function() {
  this.query_ = null;
  this.resetSelection_();
  CodeMirror.search.closeSearchPanel(this.editorView_);
};

/**
 * @return {integer}
 * Return current search index.
 */
Search.prototype.getCurrentIndex = function() {
  if (this.resultsCount_ === 0) {
    return 0;
  }
  return this.index_ + 1;
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

  CodeMirror.search.openSearchPanel(this.editorView_);

  this.editorView_.dispatch({
    effects: CodeMirror.search.setSearchQuery.of(
      new CodeMirror.search.SearchQuery({search: query, caseSensitive: false, literal: true})
    )
  });

  this.computeResultsCount_(query);

  //CodeMirror.search.selectMatches(this.editorView_);

  // XXX this doesn't quite match previous behaviour, where we would find the
  // match from the start of selection. This also breaks index tracking.
  // e.g. "hello |hello>", searching for "h" matches the first "h"
  this.findNext(/*opt_reverse=*/true);
  this.findNext(/*opt_reverse=*/false);
};

/**
 * @param {boolean} opt_reverse
 * Select the next match when user presses Enter in search field or clicks on
 * "Next" and "Previous" search navigation buttons.
 */
Search.prototype.findNext = function(opt_reverse) {
  if (opt_reverse) {
    this.index_++;
    CodeMirror.search.findPrevious(this.editorView_);
  } else {
    this.index_ += this.resultsCount_ - 1;
    CodeMirror.search.findNext(this.editorView_);
  }

  this.index_ %= this.resultsCount_;
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
  this.editorView_.focus();
};
