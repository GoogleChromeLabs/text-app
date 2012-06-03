var EditSession = ace.require("ace/edit_session").EditSession;

app.factory('editor', function() {
  var editor = ace.edit('editor');

  editor.setTheme("ace/theme/monokai");
  editor.setSession(new EditSession(''));
  editor.getSession().setMode("ace/mode/javascript");
  editor.renderer.setShowPrintMargin(false);


  return {
    focus: function() {
      setTimeout(function() {
        editor.focus();
      }, 0);
    },

    getContent: function() {
      return editor.getSession().getDocument().getValue();
    },

    setContent: function(content) {
      editor.setSession(new EditSession(content));
      editor.getSession().setMode("ace/mode/javascript");
    },

    _editor: editor
  };
});