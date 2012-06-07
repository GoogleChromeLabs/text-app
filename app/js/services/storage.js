// chrome.storage (when extension / platform app)
// http://code.google.com/chrome/extensions/trunk/storage.html
//
// localStorage (when testing as a web app)
app.value('storage', chrome.storage && chrome.storage.local || {
  get: function(key) {
    return localStorage.getItem(key);
  },
  set: function(key, value) {
    localStorage.setItem(key, value);
  }
});