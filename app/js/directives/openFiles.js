app.directive('openFiles', function($exceptionHandler) {
  return {
    compile: function(tplElm, tplAttr) {
      tplElm.after('<input type="file" multiple style="display: none;">');

      return function(scope, elm, attr) {
        var input = angular.element(elm[0].nextSibling);

        // evaluate the expression when file changed (user selects a file)
        input.bind('change', function() {
          try {
            scope.$eval(attr.openFiles, {$files: input[0].files});
          } catch(e) {
            $exceptionHandler(e);
          }
        });

        // trigger file dialog when the button clicked
        elm.bind('click', function() {
          input[0].click();
        });
      };
    }
  };
});
