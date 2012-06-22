describe 'controllers.Settings', ->
  scope = null

  # use all mocks
  beforeEach module 'mocks'

  beforeEach inject ($controller, $rootScope) ->
    scope = $rootScope.$new()
    $controller 'Settings', {$scope: scope}


  it 'should publish settings', inject (settings) ->
    expect(scope.settings).toBe settings


  it 'should publish constants', inject (settings) ->
    expect(scope.THEMES).toBe settings.THEMES
    expect(scope.KEY_MODES).toBe settings.KEY_MODES
    expect(scope.SOFT_WRAP).toBe settings.SOFT_WRAP
    expect(scope.SOFT_TABS).toBe settings.SOFT_TABS
