TD.value('appWindow', {
  close: function() {
    window.close();
  },
  maximize: function() {
    window.chrome.app.window.maximize();
  },
  restore: function() {
    window.chrome.app.window.restore();
  }
});
