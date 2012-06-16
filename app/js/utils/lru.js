TD.factory('lru', function() {
  var lru = [];

  lru.touch = function(item) {
    var idx = lru.indexOf(item);

    if (idx !== -1) {
      lru.splice(idx, 1);
    }

    lru.push(item);
  };

  lru.head = function() {
    return lru[lru.length - 1] || null;
  };

  lru.tail = function() {
    return lru[0] || null;
  };

  lru.remove = function(item) {
    lru.splice(lru.indexOf(item), 1);
  };

  return lru;
});
