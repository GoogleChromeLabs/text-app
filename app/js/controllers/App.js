var MAXIMIZE_TITLE = 'Maximize';
var RESTORE_TITLE = 'Restore';

TD.controller('App', function($scope, settings, editor, focus) {

  $scope.settings = settings;

  $scope.isSidebarVisible = false;
  $scope.isSettingsVisible = false;
  $scope.isSearchVisible = false;


  $scope.toggleSearch = function(value) {
    $scope.isSearchVisible = angular.isDefined(value) ? value : !$scope.isSearchVisible;

    if ($scope.isSearchVisible) {
      focus('input[ng-model=search]');
    } else {
      $scope.search = '';
      editor.clearFilter();
      editor.focus();
    }
  };


  $scope.doSearch = function() {
    if (!$scope.search) {
      return;
    }

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
    } else {
      editor.find($scope.search);
    }
  };


  $scope.searchPrevious = function() {
    if (!$scope.search || $scope.search.charAt(0) === '/' || $scope.search.charAt(0) === ':') {
      return;
    }

    editor.findPrevious();
  };


  $scope.searchNext = function() {
    if (!$scope.search || $scope.search.charAt(0) === '/' || $scope.search.charAt(0) === ':') {
      return;
    }

    editor.findNext();
  };


  $scope.enterSearch = function() {
    if (!$scope.search) {
      return;
    }

    if ($scope.search.charAt(0) === '/') {
      editor.goToFirstFiltered();
      editor.focus();
    } else if ($scope.search.charAt(0) === ':') {
      $scope.toggleSearch(false);
    } else {
      editor.findNext();
    }
  };


  $scope.$on('search', function() {
    $scope.toggleSearch();
  });


  $scope.$on('tab_deselected', function() {
    $scope.toggleSearch(false);
  });
});
