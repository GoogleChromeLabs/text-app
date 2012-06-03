app.factory('EditSession', function() {
  return ace.require("ace/edit_session").EditSession;
});

app.factory('editor', function(EditSession) {
  var editor = ace.edit('editor');

  editor.setTheme("ace/theme/monokai");
  editor.renderer.setShowPrintMargin(false);


  return {
    focus: function() {
      setTimeout(function() {
        editor.focus();
      }, 0);
    },

    setSession: function(session) {
      editor.setSession(session);
    },

    clearSession: function() {
      editor.setSession(new EditSession(''));
    },

    _editor: editor
  };
});
