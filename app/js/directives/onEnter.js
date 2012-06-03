app.directive('onEnter', function() {
  return function(scope, elm, attr) {
    elm.bind('keypress', function(event) {
      if (event.charCode === 13) {
        scope.$apply(attr.onEnter);
      }
    });
  };
});
