TD.directive('tdWidth', function() {
  return function(scope, elm, attr) {
    scope.$watch(attr.tdWidth, function(width) {
      elm.css('width', width + 'px');
    });
  };
});
