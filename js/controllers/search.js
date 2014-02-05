/**
 * @constructor
 */
function SearchController(editor) {
  this.editor_ = editor;
  this.currentSearch_ = '';
  this.searchIndex_ = 0;

  $('#search-button').click(this.onSearchButton_.bind(this));
  $('#search-input').bind('input', this.onChange_.bind(this));
  $('#search-input').keydown(this.onKeydown_.bind(this));
  $('#search-next-button').click(this.onFindNext_.bind(this));
  $('#search-previous-button').click(this.onFindPrevious_.bind(this));
  $('body').focusin(this.onChangeFocus_.bind(this));
}

SearchController.prototype.setSearchCounting = function(opt_reverse) {
  if (this.editor_.searchCount === 0) {
    $('#search-counting').text(chrome.i18n.getMessage('searchCounting', [0, 0]));
    return;
  }
  var reverse = opt_reverse || false;
  this.searchIndex_ += reverse ? -1 : 1;
  if (this.searchIndex_ === 0)
    this.searchIndex_ = searchCount;
  else if (this.searchIndex_ > searchCount)
    this.searchIndex_ = 1;
  $('#search-counting').text(chrome.i18n.getMessage('searchCounting',
      [this.searchIndex_, this.editor_.searchCount]));
};

SearchController.prototype.onSearchButton_ = function() {
  var timeout = 200; // keep in sync with the CSS transition.
  setTimeout(function() {$('#search-input').select();}, timeout);
  $('header').addClass('search-active');

  return false;
};

SearchController.prototype.onChangeFocus_ = function() {
  if (document.activeElement === document.body ||
      $(document.activeElement).parents('.search-container').length) {
    return;
  }
  $('#search-input').val('');
  $('#search-counting').text('');
  $('header').removeClass('search-active');
  this.editor_.clearSearch();
  this.currentSearch_ = '';
  this.searchIndex_ = 0;
};

SearchController.prototype.onChange_ = function() {
  var searchString = $('#search-input').val();
  if (searchString === this.currentSearch_)
    return;
  this.currentSearch_ = searchString;
  this.searchIndex_ = 0;
  if (searchString) {
    this.editor_.find(searchString);
  } else {
    this.editor_.clearSearch();
  }
  this.setSearchCounting();
};

SearchController.prototype.onKeydown_ = function(e) {
  switch (e.keyCode) {
    case 13:
      e.stopPropagation();
      if (this.currentSearch_) {
        this.editor_.findNext(e.shiftKey /* reverse */);
        this.setSearchCounting(e.shiftKey /* reverse */);
      }
      break;

    case 27:
      e.stopPropagation();
      $('#search-input').val('');
      this.editor_.focus();
      break;
  }
};

SearchController.prototype.onFindNext_ = function() {
  if (this.currentSearch_) {
    this.editor_.findNext();
    this.setSearchCounting();
  }
};

SearchController.prototype.onFindPrevious_ = function() {
  if (this.currentSearch_) {
    this.editor_.findNext(true /* reverse */);
    this.setSearchCounting(true /* reverse */);
  }
};
