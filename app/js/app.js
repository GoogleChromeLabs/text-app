/**
 * @constructor
 */
function TextDrive() {
  this.tabs_ = null;
  this.windowController_ = null;
}

TextDrive.prototype.init = function() {
  this.editor_ = new Editor('editor');
  this.tabs_ = new Tabs(this.editor_);
  this.menu_controller_ = new MenuController(this.tabs_);
  this.windowController_ = new WindowController();
};

var textDrive = new TextDrive();

$(document).ready(textDrive.init.bind(textDrive));
