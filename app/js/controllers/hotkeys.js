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

  $(document).keydown(this.onKeydown_.bind(this));
};

HotkeysController.prototype.onKeydown_ = function(e) {
  if (!e.metaKey && !e.ctrlKey)
    return;

  switch (e.keyCode) {
    case 9:  // Tab
      this.tabs_.nextTab();
      return false;
    
    case 32:  // Space
      $('#toggle-sidebar').click();
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

    case this.KEY.Y:
      this.editor_.redo();
      return false;

    case this.KEY.Z:
      if (e.shiftKey) {
        this.editor_.redo();
      } else {
        this.editor_.undo();
      }
      return false;
  }
};
