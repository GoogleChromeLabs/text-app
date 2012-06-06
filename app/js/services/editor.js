app.factory('EditSession', function() {
  return ace.require("ace/edit_session").EditSession;
});


// TODO(vojta): lazy load handlers
app.factory('VimHandler', function() {
  return ace.require("ace/keyboard/keybinding/vim").Vim;
});

app.factory('EmacsHandler', function() {
  return ace.require("ace/keyboard/keybinding/emacs").Emacs;
});


app.factory('ace', function() {
  return ace.edit('editor');
});


app.factory('editor', function(EditSession, settings, ace) {

  // default configs
  ace.setShowPrintMargin(false);

  var updateSoftWrapSettings = function(wrap, session) {
    switch (wrap) {
      case -1:
        session.setUseWrapMode(false);
        break;
      case 0:
        session.setUseWrapMode(true);
        session.setWrapLimitRange(null, null);
        break;
      default:
        session.setUseWrapMode(true);
        session.setWrapLimitRange(wrap, wrap);
    }
  };

  // listen on settings changes
  settings.on('theme', function(theme) {
    ace.setTheme(theme.id);
  });

  settings.on('keyMode', function(mode) {
    ace.setKeyboardHandler(mode.handler);
  });

  settings.on('useSoftTabs', function(use) {
    ace.getSession().setUseSoftTabs(use);
  });

  settings.on('tabSize', function(size) {
    ace.getSession().setTabSize(size);
  });

  settings.on('softWrap', function(wrap) {
    updateSoftWrapSettings(wrap, ace.getSession());
  });


  return {
    focus: function() {
      setTimeout(function() {
        ace.focus();
      }, 0);
    },

    setSession: function(session) {
      session.setFoldStyle('markbegin');

      // apply current settings
      session.setUseSoftTabs(settings.useSoftTabs);
      session.setTabSize(settings.tabSize);
      updateSoftWrapSettings(settings.softWrap, session);

      ace.setSession(session);
    },

    clearSession: function() {
      ace.setSession(new EditSession(''));
    },

    _editor: ace
  };
});
