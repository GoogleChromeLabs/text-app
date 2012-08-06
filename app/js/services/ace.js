// TODO(vojta): lazy load handlers
TD.factory('VimHandler', function() {
  return ace.require("ace/keyboard/vim").handler;
});


TD.factory('EmacsHandler', function() {
  return ace.require("ace/keyboard/emacs").handler;
});


TD.factory('ace', function() {
  return ace.edit('editor');
});


TD.factory('AceRange', function() {
  return ace.require('ace/range').Range;
});


TD.factory('EditSession', function() {
  return ace.require("ace/edit_session").EditSession;
});
