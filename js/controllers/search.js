/**
 * @constructor
 */
function SearchController(search) {
  this.search_ = search;

  // When there is an active text selection, focusing the search box with the
  // mouse seems to trigger a recursive focus/focusout pair. It would be good
  // to understand why but for now drop the extra events to prevent errors.
  this.activating_ = false;

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

/** @return {number} Number of search results. */
SearchController.prototype.updateSearchCount_ = function() {
  if ($('#search-input').val().length === 0) {
    $('#search-counting').text('');
    return 0;
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
  return searchCount;
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
  if (this.activating_) {
    return;
  }

  this.activating_ = true;
  this.search_.activate();
  document.getElementById('search-input').select();
  $('header').addClass('search-active');
  this.activating_ = false;
};

SearchController.prototype.deactivateSearch_ = function(e) {
  if (this.activating_) {
    return;
  }

  // relatedTarget is null if the element clicked on can't receive focus
  if (!e.relatedTarget || !e.relatedTarget.closest('.search-container')) {
    $('#search-input').val('');
    $('#search-counting').text('');
    $('header').removeClass('search-active');
    $('.search-navigation-button').removeClass('has-results');
    this.search_.deactivate();
  }
};

SearchController.prototype.onChange_ = function() {
  var searchString = $('#search-input').val();
  if (searchString === this.search_.getQuery())
    return;

  this.search_.find(searchString);
  const numResults = this.updateSearchCount_();

  // Only show the Prev and Next buttons if there are search results.
  if (numResults > 0) {
    $('.search-navigation-button').addClass('has-results');
  } else {
    $('.search-navigation-button').removeClass('has-results');
  }
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
