/**
 * @constructor
 * @param {CodeMirror} cm CodeMirror object.
 */
function Search(cm) {
  this.cm_ = cm;
  this.cursor_ = null;
  this.query_ = null;
  this.index_ = 0;
  this.resultsCount_ = 0;
  this.overlay_ = null;
};

/**
 * @param {string} query
 * @param {CodeMirror.Pos} pos
 * Get a search cursor that is always case insensitive.
 */
Search.prototype.getCursor_ = function(query, pos) {
  return this.cm_.getSearchCursor(query, pos, true /* case insensitive */);
};

/**
 * @param {string} query
 * @return {string}
 * Escape search query.
 */
Search.prototype.escapeSearchQuery_ = function(query) {
  return query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

/**
 * @param {string} query
 * @return {integer}
 * Get results count for a query search.
 */
Search.prototype.computeResultsCount_ = function(query) {
  var search = new RegExp(this.escapeSearchQuery_(query), 'ig');
  var results = this.cm_.getValue().match(search);
  return (results && results.length) || 0;
};

/**
 * @param {string} query
 * Get an overlay which highlights search results.
 */
Search.prototype.getOverlay_ = function(query) {
  var search = new RegExp(this.escapeSearchQuery_(query), 'i');
  return { token: function(stream) {
      if (stream.match(search))
        return "searching";
      stream.next();
  }};
};

/**
 * Remove the overlay which highlights search results.
 */
Search.prototype.removeOverlay_ = function() {
  this.cm_.removeOverlay(this.overlay_);
};

/**
 * Add the overlay which highlights search results.
 */
Search.prototype.addOverlay_ = function() {
  this.removeOverlay_();
  this.overlay_ = this.getOverlay_(this.query_);
  this.cm_.addOverlay(this.overlay_);
};

/**
 * Reset selection.
 */
Search.prototype.resetSelection_ = function() {
  this.cm_.setCursor(this.cm_.getCursor('anchor'));
};

/**
 * Remove overlay and reset selection.
 */
Search.prototype.clear = function() {
  this.cursor_ = null;
  this.removeOverlay_();
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
 * Initialize query search.
 */
Search.prototype.find = function(query) {
  this.query_ = query;

  // If there is no selection, we start at cursor. If there is, we start at the
  // beginning of it.
  var currentPos = this.cm_.getCursor('start');

  this.cursor_ = this.getCursor_(query, currentPos);
  this.index_ = 0;
  this.resultsCount_ = this.computeResultsCount_(query);

  // Actually go to the match.
  this.findNext();
};

/**
 * @param {boolean} opt_reverse
 * Select the next or previous match and add an overlay on search results.
 */
Search.prototype.findNext = function(opt_reverse) {
  if (!this.cursor_) {
    throw 'Internal error: cursor should be initialized.';
  }
  var reverse = opt_reverse || false;

  if (!this.cursor_.find(reverse)) {
    var lastLine = CodeMirror.Pos(this.cm_.lastLine());
    var firstLine = CodeMirror.Pos(this.cm_.firstLine(), 0);
    this.cursor_ = this.getCursor_(this.query_,
        reverse ? lastLine : firstLine);
    this.cursor_.find(reverse);
  }
  this.addOverlay_();

  this.index_ += reverse ? -1 : 1;
  if (this.index_ === 0) {
    this.index_ = this.resultsCount_;
  } else if (this.index_ > this.resultsCount_) {
    this.index_ = 1;
  }

  var from = this.cursor_.from();
  var to = this.cursor_.to();

  if (from && to) {
    this.cm_.setSelection(from, to);
  } else {
    this.resetSelection_();
  }
};
