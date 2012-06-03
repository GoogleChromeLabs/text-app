app.factory('tabs', function(editor, fs) {
  var tabs = [];
  tabs.select = function(tab) {
    tabs.current = tab;

    // move to editor
    editor._editor.setSession(tab && tab.session || new EditSession(''));
    editor.focus();
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

  return tabs;
});