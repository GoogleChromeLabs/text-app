TD.value('appWindow', {
  close: function() {
    window.close();
  },
  maximize: function() {
    window.chrome.app.window.current().maximize();
  },
  restore: function() {
    window.chrome.app.window.current().restore();
  }
});
