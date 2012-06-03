describe 'controllers.App', ->
  scope = null

  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope
    $controller 'App', {$scope: scope}


  it 'should public tabs and files', ->
    expect(scope.files).toBeDefined()
    expect(scope.tabs).toBeDefined()
