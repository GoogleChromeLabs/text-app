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

app.factory('editor', function(EditSession, settings) {
  var editor = ace.edit('editor');

  // default configs
  editor.renderer.setShowPrintMargin(false);

  // listen on settings changes
  settings.on('theme', function(theme) {
    editor.setTheme(theme.id);
  });

  settings.on('keyMode', function(mode) {
    editor.setKeyboardHandler(mode.handler);
  });

  settings.on('useSoftTabs', function(use) {
    editor.getSession().setUseSoftTabs(use);
  });

  settings.on('tabSize', function(size) {
    editor.getSession().setTabSize(size);
  });


  return {
    focus: function() {
      setTimeout(function() {
        editor.focus();
      }, 0);
    },

    setSession: function(session) {
      session.setFoldStyle('markbegin');
      session.setUseSoftTabs(settings.useSoftTabs);
      session.setTabSize(settings.tabSize);

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
