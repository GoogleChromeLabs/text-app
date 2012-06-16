TD.factory('tabs', function(editor, fs, $rootScope, log, EditSession, chromeFs, lru) {
  var tabs = [];

  tabs.select = function(tab) {
    tabs.current = tab;

    // move to editor
    if (tab) {
      editor.setSession(tab.session);
      lru.touch(tab);
      editor.focus();
    } else {
      editor.clearSession();
    }
  };

  tabs.close = function(tab) {
    tab = tab || tabs.current;

    var removeTab = function() {
      tabs.splice(tabs.indexOf(tab), 1);
      lru.remove(tab);
      tabs.select(lru.head());
    };

    // save the file
    var saveFile = function(writableFileEntry) {
      if (!writableFileEntry) {
        return;
      }

      fs.saveFile(writableFileEntry, tab.session.getValue()).then(function() {
        removeTab();
      });
    };

    if (!tab) {
      log('No open tab to close.');
      return;
    }

    if (!tab.modified) {
      log('Current file not modified.');
      return removeTab();
    }

    if (tab.file) {
      chromeFs.getWritableFileEntry(tab.file, saveFile);
    } else {
      chromeFs.chooseFile({type: "saveFile"}, saveFile);
    }
  };

  tabs.saveCurrent = function() {
    var tab = tabs.current;

    var saveFile = function(writableFileEntry) {
      if (!writableFileEntry) {
        return;
      }

      fs.saveFile(writableFileEntry, tab.session.getValue()).then(function() {
        tab.file = writableFileEntry;
        tab.label = writableFileEntry.name;
        tab.modified = false;
      });
    };

    if (!tab || (!tab.modified && tab.file)) {
      log('Nothing to save.');
      return;
    }

    if (tab.file) {
      chromeFs.getWritableFileEntry(tab.file, saveFile);
    } else {
      chromeFs.chooseFile({type: "saveFile"}, saveFile);
    }
  };

  tabs.selectByFile = function(file) {
    for (var i = 0; i < tabs.length; i++) {
      // TODO(vojta): use chromeFs.getDisplayPath() instead
      if (tabs[i].file && tabs[i].file.fullPath === file.fullPath) {
        tabs.select(tabs[i]);
        return true;
      }
    }

    return false;
  };

  tabs.add = function(file, content) {
    var session = new EditSession(content || '');
    var tab = {file: file || null, session: session, label: file && file.name || '<new file>'};

    session.setMode("ace/mode/javascript");
    session.on('change', function() {
      if (!tab.modified) {
        log(tab.file, 'modified');
        tab.modified = true;
        $rootScope.$digest();
      }
    });

    tabs.push(tab);
    tabs.select(tab);

    return tab;
  };

  return tabs;
});
