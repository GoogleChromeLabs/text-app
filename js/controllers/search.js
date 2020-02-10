/**
 * @constructor
 */
function SearchController(search) {
  this.search_ = search;

  document.getElementById('search-input')
      .addEventListener('focus', () => { this.activateSearch_(); });
  $('#search-input').bind('input', this.onChange_.bind(this));
  $('#search-input').keydown(this.onKeydown_.bind(this));
  // Prevent search deactivation when search count is clicked
  document.getElementById('search-counting')
      .addEventListener('mousedown', (event) => { event.preventDefault() });
  $('#search-next-button').click(this.onFindNext_.bind(this));
  $('#search-previous-button').click(this.onFindPrevious_.bind(this));
  $('.search-container').focusout(this.deactivateSearch_.bind(this));
}

SearchController.prototype.updateEditor = function(editor) {
  this.search_ = editor.getSearch();
}

SearchController.prototype.updateSearchCount_ = function() {
  if ($('#search-input').val().length === 0) {
    $('#search-counting').text('');
    return;
  }
  var searchCount = this.search_.getResultsCount();
  var searchIndex = this.search_.getCurrentIndex();
  $('#search-counting').text(chrome.i18n.getMessage('searchCounting',
      [searchIndex, searchCount]));
  if (searchCount === 0) {
    $('#search-counting').addClass('nomatches');
  } else {
    $('#search-counting').removeClass('nomatches');
  }
};

SearchController.prototype.findNext_ = function(opt_reverse) {
  if (this.search_.getQuery()) {
    this.search_.findNext(opt_reverse);
    this.updateSearchCount_(opt_reverse);
  }
};

/**
 * Moves focus to the search input and shows all search UI elements.
 * @private
 */
SearchController.prototype.activateSearch_ = function() {
  this.search_.clear();
  document.getElementById('search-input').select();
  $('header').addClass('search-active');
};

SearchController.prototype.deactivateSearch_ = function(e) {
  // relatedTarget is null if the element clicked on can't receive focus
  if (!e.relatedTarget || !e.relatedTarget.closest('.search-container')) {
    $('#search-input').val('');
    $('#search-counting').text('');
    $('header').removeClass('search-active');
    this.search_.clear();
  }
};

SearchController.prototype.onChange_ = function() {
  var searchString = $('#search-input').val();
  if (searchString === this.search_.getQuery())
    return;
  if (searchString) {
    this.search_.find(searchString);
  } else {
    this.search_.clear();
  }
  this.updateSearchCount_();
};

SearchController.prototype.onKeydown_ = function(e) {
  switch (e.key) {
    case 'Enter':
      e.stopPropagation();
      this.findNext_(e.shiftKey /* reverse */);
      break;

    case 'Escape':
      e.stopPropagation();
      this.search_.unfocus();
      break;
  }
};

SearchController.prototype.onFindNext_ = function() {
  this.findNext_();
};

SearchController.prototype.onFindPrevious_ = function() {
  this.findNext_(true /* reverse */);
};
