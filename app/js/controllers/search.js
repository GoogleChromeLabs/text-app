/**
 * @constructor
 */
function SearchController(editor) {
  this.editor_ = editor;
  this.currentSearch_ = '';

  $('#search-button').click(this.onSearchButton_.bind(this));
  $('#search-input').focusout(this.onFocusOut_.bind(this));
  $('#search-input').bind('input', this.onChange_.bind(this));
  $('#search-input').keypress(this.onKeypress_.bind(this));
}

SearchController.prototype.onSearchButton_ = function() {
  $('#search-button').addClass('hidden');
  $('#search-input').removeClass('hidden');

  // Timeout is for search box first to appear, and then to stretch.
  setTimeout(function() {
    $('#search-input').addClass('open');
    $('#search-input').focus();
  }, 0);

  return false;
};

SearchController.prototype.onFocusOut_ = function() {
  if ($('#search-input').val() === '') {
    $('#search-input').removeClass('open');
    $('#search-input').addClass('hidden');
    $('#search-button').removeClass('hidden');
  }
};

SearchController.prototype.onChange_ = function() {
  var searchString = $('#search-input').val();
  if (searchString === this.currentSearch_)
    return;
  this.currentSearch_ = searchString;
  if (searchString) {
    this.editor_.find(searchString);
  } else {
    this.editor_.clearSearch();
  }
};

SearchController.prototype.onKeypress_ = function(e) {
  if (e.keyCode === 13)  // Enter
    this.editor_.findNext(this.currentSearch_);
};
