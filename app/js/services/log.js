// log into console
// add log entry into $rootScope
// $digest() if not already in progress
app.provider('log', function() {
  var scope, window;

  this.$get = function($rootScope, $window) {
    scope = $rootScope;
    window = $window;

    scope.logs = [];
    scope.logs.clear = function() {
      this.length = 0;
    };

    return this.log;
  };

  this.log = function() {
    var args = Array.prototype.slice.call(arguments).map(function(arg) {
      return arg.name || arg;
//        return arg instanceof FileEntry ? arg.name : arg;
    });

    scope.logs.unshift(args.join(' '));
    window.console.log.apply(window.console, arguments);

//    if (!scope.$$phase) {
//      scope.$digest();
//    }
  };
});


// I know, it's brutal :-D
app.config(function($provide, logProvider) {
  $provide.decorator('$rootScope', function($delegate) {
    var original = $delegate.__proto__.$digest;

    $delegate.__proto__.$digest = function() {
//      if (!$delegate.$$phase) $delegate.$$phase = 'beforeDigest';
      logProvider.log('DIGEST', this.$id);
//      if ($delegate.$$phase == 'beforeDigest') $delegate.$$phase = null;

      return original.apply(this, arguments);
    };

    return $delegate;
  });
});