TD.factory('tabs', function(editor, fs, $rootScope, log, EditSession) {
  var tabs = [];

  tabs.select = function(tab) {
    tabs.current = tab;

    // move to editor
    if (tab) {
      editor.setSession(tab.session);
      editor.focus();
    } else {
      editor.clearSession();
    }
  };

  tabs.close = function(tab) {
    // remove it
    tabs.splice(tabs.indexOf(tab), 1);

    // save the file
    fs.saveFile(tab.file, tab.session.getValue());

    if (tab === tabs.current) {
      tabs.select(tabs[0]);
    }
  };

  tabs.selectByFile = function(file) {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].file.fullPath === file.fullPath) {
        tabs.select(tabs[i]);
        return true;
      }
    }

    return false;
  };

  tabs.add = function(file, content) {
    var session = new EditSession(content);
    var tab = {file: file, session: session, label: file.name};

    session.setMode("ace/mode/javascript");
    session.on('change', function() {
      if (!tab.modified) {
        log(tab.file, 'modified');
        tab.modified = true;
        $rootScope.$digest();
      }
    });

    tabs.push(tab);
    return tab;
  };

  return tabs;
});
