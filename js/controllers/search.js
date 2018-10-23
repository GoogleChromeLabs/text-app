/**
 * @constructor
 */
function SearchController(search) {
  this.search_ = search;

  $('#search-button').click(this.onSearchButton_.bind(this));
  $('#search-input').bind('input', this.onChange_.bind(this));
  $('#search-input').keydown(this.onKeydown_.bind(this));
  $('#search-next-button').click(this.onFindNext_.bind(this));
  $('#search-previous-button').click(this.onFindPrevious_.bind(this));
  $('.search-container').focusout(this.deactivateSearch_.bind(this));
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

SearchController.prototype.onSearchButton_ = function() {
  this.search_.clear();
  var timeout = 200; // keep in sync with the CSS transition.
  setTimeout(function() {$('#search-input').select();}, timeout);
  $('header').addClass('search-active');

  return false;
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
    case "Enter":
      e.stopPropagation();
      this.findNext_(e.shiftKey /* reverse */);
      break;

    case "Escape":
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
