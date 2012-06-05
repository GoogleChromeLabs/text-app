describe 'controllers.App', ->
  scope = editor = null

  beforeEach inject ($controller, $rootScope, _editor_) ->
    scope = $rootScope
    editor = _editor_
    $controller 'App', {$scope: scope}


  it 'should public tabs and files', ->
    expect(scope.files).toBeDefined()
    expect(scope.tabs).toBeDefined()


  describe 'toggleSettings', ->

    it 'toggle isSettingsVisible', ->
      scope.toggleSettings();
      expect(scope.isSettingsVisible).toBe true

      scope.toggleSettings();
      expect(scope.isSettingsVisible).toBe false

      scope.toggleSettings();
      expect(scope.isSettingsVisible).toBe true


    it 'should focus editor when closing settings panel', ->
      scope.toggleSettings() # show
      expect(editor.focus).not.toHaveBeenCalled()

      scope.toggleSettings() # hide
      expect(editor.focus).toHaveBeenCalled()
