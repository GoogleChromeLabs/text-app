/**
 * @constructor
 */
function SearchController(editor) {
  this.editor_ = editor;
  this.currentSearch_ = '';

  $('#search-button').click(this.onSearchButton_.bind(this));
  $('#search-input').bind('input', this.onChange_.bind(this));
  $('#search-input').keydown(this.onKeydown_.bind(this));
  $('#search-next-button').click(this.onFindNext_.bind(this));
  $('#search-previous-button').click(this.onFindPrevious_.bind(this));
  $('body').focusin(this.onChangeFocus_.bind(this));
}

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
      this.editor_.findNext(e.shiftKey /* reverse */);
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
