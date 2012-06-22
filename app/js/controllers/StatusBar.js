TD.controller('StatusBar', function($scope, editor, tabs, MODES, focus) {

  $scope.tabs = tabs;
  $scope.MODES = MODES;


  $scope.updateMode = function() {
    var tab = tabs.current;

    tab.session.setMode(tab.mode.id);
    tab.manualMode = true;
    editor.focus();
  };


  $scope.toggleSettings = function(value) {
    $scope.$parent.isSettingsVisible = angular.isDefined(value) ? value : !$scope.isSettingsVisible;

    if (!parent.isSettingsVisible) {
      editor.focus();
    }
  };


  $scope.toggleSearch = function(value) {
    $scope.$parent.isSearchVisible = angular.isDefined(value) ? value : !$scope.isSearchVisible;

    if ($scope.isSearchVisible) {
      $scope.search = '';
      focus('input[ng-model=search]');
    } else {
      editor.clearFilter();
      editor.focus();
    }
  };


  $scope.doSearch = function() {
    if ($scope.search.charAt(0) === ':') {
      var lineNumber = parseInt($scope.search.substr(1), 10);
      if (lineNumber) {
        editor.goToLine(lineNumber);
      }
    } else if ($scope.search.charAt(0) === '/') {
      var filter = $scope.search.substr(1);
      if (filter.length >= 3) {
        // TODO(vojta): delay
        editor.filter(new RegExp(filter, filter.toLowerCase() === filter ? 'i' : ''));
      } else {
        editor.clearFilter();
      }
    }
  };


  $scope.enterSearch = function() {
    if ($scope.search.charAt(0) === '/') {
      editor.goToFirstFiltered();
      editor.focus();
    } else {
      $scope.toggleSearch();
    }
  };


  $scope.$on('escape', function(event) {
    if ($scope.isSearchVisible) {
      $scope.toggleSearch();
    } else if ($scope.isSettingsVisible) {
      $scope.toggleSettings();
    }
  });

  $scope.$on('settings', function() {
    $scope.toggleSettings();
  });

  $scope.$on('search', function() {
    $scope.toggleSearch();
  });

  $scope.$on('tab_deselected', function() {
    $scope.toggleSearch(false);
  });
});
