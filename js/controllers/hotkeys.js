/**
 * @constructor
 */
function HotkeysController(windowController, tabs, editor, settings,
    settingsController) {
  this.windowController_ = windowController;
  this.tabs_ = tabs;
  this.editor_ = editor;
  this.settings_ = settings;
  this.settingsController_ = settingsController;

  this.ZOOM_IN_FACTOR = 9 / 8;
  this.ZOOM_OUT_FACTOR = 8 / 9;

  $(document).keydown(this.onKeydown_.bind(this));
};

/**
 * Update the editor.
 */
HotkeysController.prototype.updateEditor = function(editor) {
  this.editor_ = editor;
};

/**
 * Handles hotkey combination if present in keydown event.
 * Some hotkeys are handled by CodeMirror directly. Among them:
 * Ctrl-C, Ctrl-V, Ctrl-X, Ctrl-Z, Ctrl-Y, Ctrl-A
 * @param {!Event} e The keydown event
 * @private
 */
HotkeysController.prototype.onKeydown_ = function(e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'Tab':
        if (e.shiftKey) {
          this.tabs_.previousTab();
        } else {
          this.tabs_.nextTab();
        }
        return false;

      case 'e':
      case 'E':
        // Focus the first button in the sidebar. This includes opening
        // the sidebar and closing settings if needed.
        this.windowController_.openSidebar();
        this.settingsController_.closeSettings();
        document.querySelector('.sidebar-button').focus();
        return false;

      case 'f':
      case 'F':
        document.getElementById('search-input').focus();
        return false;

      case 'n':
      case 'N':
        if (e.shiftKey) {
          this.tabs_.newWindow();
        } else {
          this.tabs_.newTab();
        }
        return false;

      case 'o':
      case 'O':
        this.tabs_.openFiles();
        return false;

      case 'p':
      case 'P':
        window.print();
        return false;

      case 's':
      case 'S':
        if (e.shiftKey) {
          this.tabs_.saveAs();
        }
        else {
          this.tabs_.save();
        }
        return false;

      case 'w':
      case 'W':
        if (e.shiftKey) {
          this.windowController_.close();
        } else {
          this.tabs_.closeCurrent();
        }
        return false;

      case '0':
      case ')':
        this.settings_.reset('fontsize');
        return false;

      case '+':
      case '=':
        var fontSize = this.settings_.get('fontsize');
        this.settings_.set('fontsize', fontSize * this.ZOOM_IN_FACTOR);
        return false;

      case '-':
      case '_':
        var fontSize = this.settings_.get('fontsize');
        this.settings_.set('fontsize', fontSize * this.ZOOM_OUT_FACTOR);
        return false;

      default:
        break;
    }
  } else if (e.altKey) {
    if (e.key === ' ') {
      $('#toggle-sidebar').click();
      return false;
    }
  }
};
