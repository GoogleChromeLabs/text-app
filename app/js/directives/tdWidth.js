TD.directive('tdWidth', function() {
  return function(scope, elm, attr) {
    scope.$watch(attr.tdWidth, function(width) {
      console.log('WIDTH', width + 'px');
      elm.css('width', width + 'px');
    });
  };
});
