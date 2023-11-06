/**
 * @constructor
 * @param {EditorView} editorView
 */
function Search(editorView) {
  this.editorView_ = editorView;
  this.query_ = "";
  // Index of the currently selected match, starting from 0.
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

  if (!query) {
    return;
  }

  const cursor = this.editorView_.state.selection.main.anchor;

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
  const cursor = this.editorView_.state.selection.main.anchor;
  this.editorView_.dispatch({
    selection: CodeMirror.state.EditorSelection.single(cursor),
  });
};

/**
 * Called when the user focuses the search box.
 */
Search.prototype.activate = function() {
  this.resetSelection_();
  CodeMirror.search.openSearchPanel(this.editorView_);
};

/**
 * Called when the user unfocuses the search box.
 */
Search.prototype.deactivate = function() {
  this.find("");
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
 * @param {string} query Search query, may be empty.
 * Initialize search. This is called every time the search string is updated.
 */
Search.prototype.find = function(query) {
  this.query_ = query;

  this.editorView_.dispatch({
    effects: CodeMirror.search.setSearchQuery.of(
      new CodeMirror.search.SearchQuery({search: query, caseSensitive: false, literal: true})
    )
  });

  this.computeResultsCount_(query);

  this.resetSelection_();
  if (this.resultsCount_) {
    // Select the first match not before the cursor. We set index_ earlier
    // as if that match was selected.
    this.index_--;
    this.findNext(/*opt_reverse=*/false);
  }
};

/**
 * @param {boolean} opt_reverse
 * Select the next match when user presses Enter in search field or clicks on
 * "Next" and "Previous" search navigation buttons.
 */
Search.prototype.findNext = function(opt_reverse) {
  if (opt_reverse) {
    this.index_ += this.resultsCount_ - 1;
    CodeMirror.search.findPrevious(this.editorView_);
  } else {
    this.index_++;
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
