app.filter('toClass', function() {
  return function(log) {
    return angular.lowercase(log).replace(/[\:\,]/g, '').replace(/\[.*\]/, '');
  };
});