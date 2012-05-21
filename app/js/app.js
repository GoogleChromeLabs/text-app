var app = angular.module('TD', []);

app.factory('editor', function() {
  var editor = ace.edit('editor');
  var EditSession = ace.require("ace/edit_session").EditSession;
  var INIT_CONTENT = "function reverseString(str) {\n" +
                     "  return str.split('').reverse().join('');\n" +
                     "}\n";

  editor.setSession(new EditSession(INIT_CONTENT));
  editor.setTheme("ace/theme/twilight");
  editor.getSession().setMode("ace/mode/javascript");

  return editor;
});


app.run(function(editor) {
  editor.focus();
});
