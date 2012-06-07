app.directive('onEsc', function() {
  return function(scope, elm, attr) {
    elm.bind('keyup', function(event) {
      if (event.keyCode === 27) {
        scope.$apply(attr.onEsc);
      }
    });
  };
});
