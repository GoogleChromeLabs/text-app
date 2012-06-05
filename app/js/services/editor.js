app.factory('EditSession', function() {
  return ace.require("ace/edit_session").EditSession;
});

app.factory('VimHandler', function() {
  return ace.require("ace/keyboard/keybinding/vim").Vim;
});

// TODO(vojta): lazy load handlers
app.factory('EmacsHandler', function() {
  return ace.require("ace/keyboard/keybinding/emacs").Emacs;
});

app.factory('editor', function(EditSession) {
  var editor = ace.edit('editor');

  editor.renderer.setShowPrintMargin(false);

  return {
    focus: function() {
      setTimeout(function() {
        editor.focus();
      }, 0);
    },

    setSession: function(session) {
      session.setFoldStyle('markbegin');
      editor.setSession(session);
    },

    clearSession: function() {
      editor.setSession(new EditSession(''));
    },

    setTheme: function(theme) {
      editor.setTheme(theme);
    },

    setKeyboardHandler: function(handler) {
      editor.setKeyboardHandler(handler);
    },

    _editor: editor
  };
});
