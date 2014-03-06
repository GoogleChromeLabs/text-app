/**
 * @constructor
 * @param {HTMLElement} container
 * @param {Editor} editor
 */
function DialogController(container, editor) {
  this.container_ = container;
  this.editor_ = editor;
  this.disabledElements_ = [];
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

  this.disableEverything_();

  $(document).bind('keydown.dialog', this.onKeydown_.bind(this));
  this.container_.find('.dialog-button').first().focus();
};

DialogController.prototype.disableEverything_ = function() {
  this.editor_.disable();
  var inputs = $('input, select, textarea');
  for (var i = 0; i < inputs.length; i++) {
    this.disabledElements_.push({'element': inputs[i],
                               'index': inputs[i].tabIndex});
    inputs[i].tabIndex = -1;
  }
};

DialogController.prototype.reenableEverything_ = function() {
  for (var i = 0; i < this.disabledElements_.length; i++) {
    this.disabledElements_[i]['element'].tabIndex =
        this.disabledElements_[i]['index'];
  }
  this.editor_.enable();
};

DialogController.prototype.resetButtons = function() {
  this.container_.find('.dialog-button').remove();
};

DialogController.prototype.addButton = function(id, text) {
  var button = $('<button class="dialog-button"></button>');
  button.attr('id', id);
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
  this.container_.removeClass('open');
  this.reenableEverything_();
  if (this.callback_)
    this.callback_(id);
};

/**
 * Focus the next of previous button.
 * @param {number} delta +1 for next, -1 for previous.
 */
DialogController.prototype.next_ = function(delta) {
  var buttons = $('.dialog-button');
  var newIndex = $.inArray(document.activeElement, buttons) + delta;
  if (newIndex < 0)
    newIndex += buttons.length;
  if (newIndex >= buttons.length)
    newIndex -= buttons.length;
  $(buttons[newIndex]).focus();
};

DialogController.prototype.onKeydown_ = function(e) {
  e.stopPropagation();
  switch (e.keyCode) {
     case 27:  // Escape
       this.onClick_('cancel');
       return false;

     case 37:  // <-
       this.next_(-1);
       return false;
       break;

     case 39:  // ->
       this.next_(1);
       return false;
       break;
  }
};
