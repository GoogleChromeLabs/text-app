describe 'controllers.App', ->
  scope = editor = null

  # use all mocks
  beforeEach module 'mocks'

  beforeEach inject ($controller, $rootScope, _editor_) ->
    scope = $rootScope.$new()
    editor = _editor_
    $controller 'App', {$scope: scope}


  it 'should publish tabs and settings', inject (settings, tabs) ->
    expect(scope.settings).toBe settings
    expect(scope.tabs).toBe tabs


  describe 'events', ->
    broadcast = null

    beforeEach inject ($rootScope) ->
      broadcast = (event) ->
        $rootScope.$broadcast event

    it 'should handle "quit"', inject (quitApp, settings) ->
      spyOn settings, 'store'
      broadcast 'quit'

      expect(settings.store).toHaveBeenCalled()
      expect(quitApp).toHaveBeenCalled();


  describe 'quit', ->

    it 'should store settings and quit the app', inject (quitApp, settings) ->
      spyOn settings, 'store'
      scope.quit()

      expect(settings.store).toHaveBeenCalled()
      expect(quitApp).toHaveBeenCalled();
