TD.factory('EditSession', function() {
  return ace.require("ace/edit_session").EditSession;
});


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


TD.factory('HiddingFolding', function(AceRange) {
  return function(regexp) {
    var cache = [];

    this.getFoldWidget = function(session, foldStyle, row) {
      var previousMatch = cache[row - 1];
      var line = session.getLine(row);
      var currentMatch = cache[row] = regexp.test(line);

      if (row === 0) {
        return currentMatch ? '' : 'start';
      } else {
        if (!previousMatch) {
          return '';
        } else {
          return currentMatch ? '' : 'start';
        }
      }
    };

    this.getFoldWidgetRange = function(session, foldStyle, row) {
      var start = {row: row, column: 0};
      var end = {};

      while (!cache[row]) {
        if (typeof cache[row] === 'undefined') {
          if (row >= session.getLength()) break;
          this.getFoldWidget(session, foldStyle, row);
          if (cache[row]) break;
        }
        row++;
      }

      end.row = row - 1;
      end.column = session.getLine(end.row).length;

      return AceRange.fromPoints(start, end);
    };
  };
});


TD.factory('editor', function(EditSession, HiddingFolding, settings, ace) {

  var updateSoftWrapSettings = function(wrap, session) {
    switch (wrap) {
      case -1:
        session.setUseWrapMode(false);
        ace.setShowPrintMargin(false);
        break;
      case 0:
        session.setUseWrapMode(true);
        session.setWrapLimitRange(null, null);
        ace.setShowPrintMargin(false);
        break;
      default:
        session.setUseWrapMode(true);
        session.setWrapLimitRange(wrap, wrap);
        ace.setPrintMarginColumn(wrap);
        ace.setShowPrintMargin(true);
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

  var isFiltered = false;

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
      ace.setReadOnly(false);
    },

    clearSession: function() {
      ace.setSession(new EditSession(''));
      ace.setReadOnly(true);
    },

    goToLine: function(lineNumber) {
      ace.gotoLine(lineNumber)
    },

    filter: function(regexp) {
      var session = ace.getSession();

      session.unfold();
      session.$setFolding(new HiddingFolding(regexp));
      session.foldAll();
      isFiltered = true;
    },

    clearFilter: function() {
      if (!isFiltered) {
        return;
      }

      var session = ace.getSession();

      session.unfold();
      session.$setFolding(null);
      isFiltered = false;
    },

    goToFirstFiltered: function() {
      var session = ace.getSession();
      var firstFilteredRow = session.getNextFoldLine(0).end.row + 2;

      this.goToLine(firstFilteredRow);
    },

    _editor: ace
  };
});
