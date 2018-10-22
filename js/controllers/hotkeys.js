/**
 * Enum for keyboard event keycodes
 * @enum {number}
 */
const Keycode = {
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  SPACE: 32,
  ZERO: 48,
  NUMPAD_ZERO: 96,
  NUMPAD_PLUS: 107,
  NUMPAD_MINUS: 109,
  PLUS: 187,
  MINUS: 189
};
// Populate Keycode enum A - Z
for (var i = 65; i <= 90; i++) {
  Keycode[String.fromCharCode(i).toUpperCase()] = i
}
Object.freeze(Keycode);


/**
 * @constructor
 */
function HotkeysController(windowController, tabs, editor, settings, analytics) {
  this.windowController_ = windowController;
  this.tabs_ = tabs;
  this.editor_ = editor;
  this.settings_ = settings;
  this.analytics_ = analytics;

  this.ZOOM_IN_FACTOR = 9/8;
  this.ZOOM_OUT_FACTOR = 8/9;

  $(document).keydown(this.onKeydown_.bind(this));
  document.addEventListener('mousewheel', this.onMouseWheel_.bind(this));
};

/**
 * Some hotkeys are handled by CodeMirror directly. Among them:
 * Ctrl-C, Ctrl-V, Ctrl-X, Ctrl-Z, Ctrl-Y, Ctrl-A
 */
HotkeysController.prototype.onKeydown_ = function(e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.keyCode) {
      case Keycode.TAB:
        if (e.shiftKey) {
          this.tabs_.previousTab();
        } else {
          this.tabs_.nextTab();
        }
        return false;

      case Keycode.F:
        $('#search-button').click();
        return false;

      case Keycode.N:
        if (e.shiftKey) {
          this.tabs_.newWindow();
        } else {
          this.tabs_.newTab();
        }
        return false;

      case Keycode.O:
        this.tabs_.openFiles();
        return false;

      case Keycode.P:
        this.analytics_.reportEvent('action', 'print');
        window.print();
        return false;

      case Keycode.S:
        if (e.shiftKey) {
          this.tabs_.saveAs();
        } else {
          this.tabs_.save();
        }
        return false;

      case Keycode.W:
        if (e.shiftKey) {
          this.windowController_.close();
        } else {
          this.tabs_.closeCurrent();
        }
        return false;

      case Keycode.Z:
        if (e.shiftKey) {
          this.editor_.redo();
          return false;
        }
        break;

      case Keycode.ZERO:
      case Keycode.NUMPAD_ZERO:
        this.settings_.reset('fontsize');
        return false;

      case Keycode.PLUS:
      case Keycode.NUMPAD_PLUS:
        var fontSize = this.settings_.get('fontsize');
        this.settings_.set('fontsize', fontSize * this.ZOOM_IN_FACTOR);
        return false;

      case Keycode.MINUS:
      case Keycode.NUMPAD_MINUS:
        var fontSize = this.settings_.get('fontsize');
        this.settings_.set('fontsize', fontSize * this.ZOOM_OUT_FACTOR);
        return false;
    }
  } else if (e.altKey) {
    if (e.keyCode === Keycode.SPACE) {
      $('#toggle-sidebar').click();
      return false;
    }
  }
};

HotkeysController.prototype.onMouseWheel_ = function(e) {
  if (e.ctrlKey || e.metaKey) {
    var fontSize = this.settings_.get('fontsize');
    if (e.wheelDelta > 0) {
      this.settings_.set('fontsize', fontSize * this.ZOOM_IN_FACTOR);
    } else {
      this.settings_.set('fontsize', fontSize * this.ZOOM_OUT_FACTOR);
    }
  }
};
