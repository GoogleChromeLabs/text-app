describe 'controllers Settings', ->
  scope = null

  # use all mocks
  beforeEach module 'mocks'

  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    $controller 'Settings', {$scope: scope}


  it 'should publish settings', inject (settings) ->
    expect(scope.settings).toBe settings


  it 'should publish constants', inject (settings) ->
    expect(scope.THEMES).toBeDefined()
    expect(scope.KEY_MODES).toBeDefined()
    expect(scope.SOFT_WRAP).toBeDefined()
    expect(scope.SOFT_TABS).toBeDefined()
