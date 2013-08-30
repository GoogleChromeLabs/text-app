/**
 * @constructor
 */
function DialogController(container) {
  this.container_ = container;
};

/**
 * The callback will be called when any of the buttons will be clicked, or Esc
 * is pressed. In case of button click, the button id is passed to callback. In
 * case of Esc, 'cancel' is passed.
 */
DialogController.prototype.show = function(callback) {
  if (this.container_.hasClass('open')) {
    console.error('Trying to open dialog when it is already visible.');
    console.error(new Error());
    return;
  }
  this.callback_ = callback;
  this.container_.addClass('open');

  // In case any new focusable elements appear, they either should be added here
  // and in onClick_, or some general code should be written to disable/enable
  // them.
  $('#editor textarea').attr('tabIndex', '-1');

  $(document).bind('keydown.dialog', this.onKeydown_.bind(this));
  this.container_.find('.dialog-button').first().focus();
};

DialogController.prototype.resetButtons = function() {
  this.container_.find('.dialog-button').remove();
};

DialogController.prototype.addButton = function(id, text) {
  var button = $('<div class="dialog-button"></div>');
  button.attr('tabindex', '0');
  button.text(text);
  button.click(this.onClick_.bind(this, id));
  button.keydown(this.onKeydown_.bind(this));
  this.container_.find('.dialog-buttons').append(button);
};

DialogController.prototype.setText = function(text) {
  this.container_.find('.dialog-text').text(text);
};

DialogController.prototype.onClick_ = function(id) {
  $(document).unbind('keydown.dialog');
  $('#editor textarea').attr('tabIndex', '0');
  this.container_.removeClass('open');
  if (this.callback_)
    this.callback_(id);
};

DialogController.prototype.onKeydown_ = function(e) {
  e.stopPropagation();
  if (e.keyCode === 27)
    this.onClick_('cancel');

  return false;
};
