/**
 * @constructor
 */
function DialogController(container) {
  this.container_ = container;
  this.getInputValue_ = function() { return null; }
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
  var inputs = this.container_.find('.dialog-input-container.open');
  if (this.container_.find('.dialog-input-container').hasClass('open')) {
    this.container_.find('.dialog-input').first().focus();
  } else {
    // TODO(mpcomplete): Why doesn't this work without a timeout?
    setTimeout(function() {
      this.container_.find('.dialog-button').first().focus();
    }.bind(this), 0);
  }
};

DialogController.prototype.resetButtons = function() {
  this.container_.find('.dialog-button').remove();
  this.container_.find('.dialog-file-chooser-entry').remove();
};

DialogController.prototype.addButton = function(id, text) {
  var button = $('<div class="dialog-button"></div>');
  button.attr('tabindex', '0');
  button.text(text);
  button.click(this.onClick_.bind(this, id));
  button.keydown(this.onKeydown_.bind(this));
  this.container_.find('.dialog-buttons').append(button);
};

DialogController.prototype.addFileEntry = function(entry, text) {
  var item = $('<li class="dialog-file-chooser-entry"></li>');
  item.attr('tabindex', '0');
  item.text(text);
  item.click(this.onFileSelected_.bind(this, entry, item));
  item.keydown(this.onKeydown_.bind(this));
  this.container_.find('.dialog-file-chooser').append(item);
  this.container_.find('.dialog-file-chooser').addClass('open');
};

DialogController.prototype.onFileSelected_ = function(entry, item) {
  this.container_.find('.dialog-input').val(entry.name);
  this.container_.find('.dialog-file-chooser-entry').removeClass('active');
  item.addClass('active');
  this.getInputValue_ = function() { return entry; }
};

DialogController.prototype.setInput = function(id, text) {
  var input = this.container_.find('.dialog-input');
  input.attr('tabindex', '0');
  input.val('');
  this.container_.find('.dialog-input-label').text(text);
  this.container_.find('.dialog-input-container').addClass('open');
  input.keydown(function() {
    this.container_.find('.dialog-file-chooser-entry').removeClass('active');
    this.getInputValue_ = function() { return {name: input.val()}; };
  }.bind(this));
};

DialogController.prototype.setText = function(text) {
  this.container_.find('.dialog-text').text(text);
};

DialogController.prototype.onClick_ = function(id) {
  $(document).unbind('keydown.dialog');
  $('#editor textarea').attr('tabIndex', '0');
  this.container_.removeClass('open');
  this.container_.find('.dialog-file-chooser').removeClass('open');
  this.container_.find('.dialog-input-container').removeClass('open');
  if (this.callback_)
    this.callback_(id, this.getInputValue_());
};

DialogController.prototype.onKeydown_ = function(e) {
  e.stopPropagation();
  if (e.keyCode === 27)
    this.onClick_('cancel');

  return true;
};
