TD.factory('editor', function(EditSession, FilterFolding, settings, ace) {

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

  var updateSoftTabs = function(tabs, session) {
    if (tabs === -1) {
      session.setUseSoftTabs(false);
      session.setTabSize(4);
    } else {
      session.setUseSoftTabs(true);
      session.setTabSize(tabs);
    }
  };

  // listen on settings changes
  settings.on('theme', function(theme) {
    ace.setTheme(theme.id);
  });

  settings.on('keyMode', function(mode) {
    ace.setKeyboardHandler(mode.handler);
  });

  settings.on('softTabs', function(tabs) {
    updateSoftTabs(tabs, ace.getSession());
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
      updateSoftTabs(settings.softTabs, session);
      updateSoftWrapSettings(settings.softWrap, session);

      ace.setSession(session);
      ace.setReadOnly(false);
    },

    clearSession: function() {
      ace.setSession(new EditSession(''));
      ace.setReadOnly(true);
    },

    goToLine: function(lineNumber) {
      ace.gotoLine(lineNumber);
    },

    filter: function(regexp) {
      var session = ace.getSession();

      session.unfold();
      session.$setFolding(new FilterFolding(regexp));
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
      var nextFoldLine = session.getNextFoldLine(0);

      if (nextFoldLine) {
        this.goToLine(nextFoldLine.end.row + 2);
      }
    },

    find: function(value) {
      return ace.find(value);
    },

    findNext: function() {
      return ace.findNext();
    },

    findPrevious: function() {
      return ace.findPrevious();
    }
  };
});


TD.factory('FilterFolding', function(AceRange) {
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
          if (row >= session.getLength()) {
            break;
          }
          this.getFoldWidget(session, foldStyle, row);
          if (cache[row]) {
            break;
          }
        }
        row++;
      }

      end.row = row - 1;
      end.column = session.getLine(end.row).length;

      return AceRange.fromPoints(start, end);
    };
  };
});
