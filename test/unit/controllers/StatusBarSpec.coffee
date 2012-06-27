describe 'controllers StatusBar', ->
  scope = editor = null

  # use all mocks
  beforeEach module 'mocks'

  beforeEach inject ($controller, $rootScope, _editor_) ->
    scope = $rootScope.$new()
    editor = _editor_
    $controller 'StatusBar', {$scope: scope}


  it 'should publish tabs and MODES', inject (tabs, MODES) ->
    expect(scope.tabs).toBe tabs
    expect(scope.MODES).toBe MODES


  describe 'toggleSettings', ->

    it 'should toggle isSettingsVisible on parent', inject ($rootScope) ->
      scope.toggleSettings()
      expect($rootScope.isSettingsVisible).toBe true

      scope.toggleSettings()
      expect($rootScope.isSettingsVisible).toBe false

      scope.toggleSettings(false)
      expect($rootScope.isSettingsVisible).toBe false


    it 'should focus editor if hidding', ->
      scope.toggleSettings false
      expect(editor.focus).toHaveBeenCalled()

      scope.toggleSettings true
      expect(editor.focus.callCount).toBe 1


  describe 'events', ->
    broadcast = null

    beforeEach inject ($rootScope) ->
      broadcast = (event) ->
        $rootScope.$broadcast event


    describe 'escape', ->

      xit 'should only hide search if visible', inject ($rootScope) ->
        $rootScope.isSearchVisible = true
        $rootScope.isSettingsVisible = true
        $rootScope.$broadcast 'escape'

        expect($rootScope.isSearchVisible).toBe false
        expect($rootScope.isSettingsVisible).toBe true


      it 'should hide settings if visible', inject ($rootScope) ->
        $rootScope.isSearchVisible = false
        $rootScope.isSettingsVisible = true
        $rootScope.$broadcast 'escape'

        expect($rootScope.isSettingsVisible).toBe false
