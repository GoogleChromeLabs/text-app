app.filter('size', function() {
  return function(size) {
    return size === null ? '' : '(' + size + 'bytes)';
  };
});
