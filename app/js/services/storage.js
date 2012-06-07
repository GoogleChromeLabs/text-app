TD.value('chromeStorage', chrome.storage && chrome.storage.local || {
  set: function(data, fn) {
    localStorage.setItem('storage', JSON.stringify(data));
    setTimeout(function() {
      fn();
    }, 0);
  },
  get: function(keys, fn) {
    setTimeout(function() {
      fn(JSON.parse(localStorage.getItem('storage') || '{}'));
    }, 0);
  }
});


TD.factory('storage', function($rootScope, chromeStorage) {
  return {
    get: function(keys, fn) {
      chromeStorage.get(keys, function(data) {
        $rootScope.$apply(function() {
          fn(data);
        });
      });
    },
    set: function(data, fn) {
      chromeStorage.set(data, function() {
        $rootScope.$apply(function() {
          fn();
        });
      });
    }
  };
});