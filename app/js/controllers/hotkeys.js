/**
 * @constructor
 */
function HotkeysController(tabs, editor) {
  this.tabs_ = tabs;
  this.editor_ = editor;

  this.KEY = {};
  // create key map A - Z
  for (var i = 65; i <= 90; i++) {
    this.KEY[String.fromCharCode(i).toUpperCase()] = i;
  }

  this.KEY.TAB = 9;
  this.KEY.SPACE = 32;

  $(document).keydown(this.onKeydown_.bind(this));
};

/**
 * Some hotkeys are handled by Ace directly. Among them:
 * Ctrl-C, Ctrl-V, Ctrl-X, Ctrl-Z, Ctrl-Y, Ctrl-A
 */
HotkeysController.prototype.onKeydown_ = function(e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.keyCode) {
      case this.KEY.TAB:  // Tab
        this.tabs_.nextTab();
        return false;

      case this.KEY.F:
        $('#search-button').click();
        return false;

      case this.KEY.N:
        this.tabs_.newTab();
        return false;

      case this.KEY.O:
        this.tabs_.openFile();
        return false;

      case this.KEY.S:
        if (e.shiftKey) {
          this.tabs_.saveAs();
        } else {
          this.tabs_.save();
        }
        return false;

      case this.KEY.W:
        this.tabs_.closeCurrent();
        return false;

      case this.KEY.Z:
        if (e.shiftKey) {
          this.editor_.redo();
          return false;
        }
    }
  } else if (e.altKey) {
    if (e.keyCode === this.KEY.SPACE) {
      $('#toggle-sidebar').click();
      return false;
    }
  }
};
