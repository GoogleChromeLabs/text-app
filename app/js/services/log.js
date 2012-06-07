TD.log.provider('log', function() {
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
      return arg && arg.name || arg;
    });

    scope.logs.unshift(args.join(' '));
    window.console.log.apply(window.console, arguments);
  };
});


// I know, it's brutal :-D
TD.log.config(function($provide, logProvider) {
  $provide.decorator('$rootScope', function($delegate) {
    var original = $delegate.__proto__.$digest;

    $delegate.__proto__.$digest = function() {
      logProvider.log('DIGEST', this.$id);
      return original.apply(this, arguments);
    };

    return $delegate;
  });
});
