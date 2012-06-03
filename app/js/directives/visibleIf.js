app.directive('visibleIf', function() {
  return function(scope, elm, attr) {
    scope.$watch(attr.visibleIf, function(visible) {
      elm.css('visibility', visible ? 'visible' : 'hidden');
    });
  };
});
