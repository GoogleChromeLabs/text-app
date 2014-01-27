/**
 * @constructor
 */
function SearchController(editor) {
  this.editor_ = editor;
  this.currentSearch_ = '';
  this.timeoutID_ = null;

  $('#search-button').click(this.onSearchButton_.bind(this));
  $('#search-input').bind('input', this.onChange_.bind(this));
  $('#search-input').keydown(this.onKeydown_.bind(this));
  $('#search-next-button').click(this.onFindNext_.bind(this));
  $('#search-previous-button').click(this.onFindPrevious_.bind(this));

  $(document).bind('docfocus', this.onFocusOut_.bind(this));
}

SearchController.prototype.onSearchButton_ = function() {
  $('header').addClass('search-active');
  setTimeout(function() {$('#search-input').focus().select();}, 100);

  return false;
};

SearchController.prototype.onFocusOut_ = function() {
  $('#search-input').val('');
  $('header').removeClass('search-active');
  this.editor_.clearSearch();
  this.currentSearch_ = '';
};

SearchController.prototype.onChange_ = function() {
  var searchString = $('#search-input').val();
  if (searchString === this.currentSearch_)
    return;
  this.currentSearch_ = searchString;
  if (searchString) {
    this.editor_.find(searchString);
  }
};

SearchController.prototype.onKeydown_ = function(e) {
  switch (e.keyCode) {
    case 13:
      e.stopPropagation();
      if (e.shiftKey)
        this.editor_.findNext(true /* reverse */);
      else
        this.editor_.findNext();
      break;

    case 27:
      e.stopPropagation();
      $('#search-input').val('');
      this.editor_.focus();
      break;
  }
};

SearchController.prototype.onFindNext_ = function() {
  if (this.currentSearch_)
    this.editor_.findNext();
};

SearchController.prototype.onFindPrevious_ = function() {
  if (this.currentSearch_)
    this.editor_.findNext(true /* reverse */);
};
