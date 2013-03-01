/**
 * @constructor
 */
function SearchController(editor) {
  this.editor_ = editor;
  this.currentSearch_ = '';

  $('#search-button').click(this.onSearchButton_.bind(this));
  $('#search-input').focusout(this.onFocusOut_.bind(this));
  $('#search-input').bind('input', this.onChange_.bind(this));
  $('#search-input').keydown(this.onKeydown_.bind(this));
}

SearchController.prototype.onSearchButton_ = function() {
  $('header').addClass('search-active');
  setTimeout(function() {$('#search-input').focus();}, 100);

  return false;
};

SearchController.prototype.onFocusOut_ = function() {
  $('#search-input').val('');
  $('header').removeClass('search-active');
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
      this.editor_.findNext(this.currentSearch_);
      break;

    case 27:
      e.stopPropagation();
      $('#search-input').val('');
      this.editor_.focus();
      break;
  }
};
