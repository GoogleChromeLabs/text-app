describe 'controllers.StatusBar', ->
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


  describe 'toggleSearch', ->

    it 'should toggle isSearchVisible on parent', inject ($rootScope) ->
      scope.toggleSearch()
      expect($rootScope.isSearchVisible).toBe true

      scope.toggleSearch()
      expect($rootScope.isSearchVisible).toBe false

      scope.toggleSearch false
      expect($rootScope.isSearchVisible).toBe false

    it 'should clear the search when hidding', ->
      scope.search = 'something'
      scope.toggleSearch false

      expect(scope.search).toBe ''

    it 'should clearFilter and focus the editor when hidding', ->
      scope.toggleSearch false
      expect(editor.clearFilter).toHaveBeenCalled()
      expect(editor.focus).toHaveBeenCalled()


    it 'should focus the input when showing', inject (focus) ->
      scope.toggleSearch()
      expect(focus).toHaveBeenCalled()


  describe 'doSearch', ->

    describe 'goToLine', ->

      it 'should goToLine when search starts with ":"', ->
        scope.search = ':12'
        scope.doSearch()
        expect(editor.goToLine).toHaveBeenCalledWith 12


      it 'should ignore non numbers', ->
        scope.search = ':'
        scope.doSearch()

        scope.search = ':asd'
        scope.doSearch()

        expect(editor.goToLine).not.toHaveBeenCalled()


    describe 'grep', ->

      it 'should filter if when search starts with "/"', ->
        editor.filter.andCallFake (re) ->
          expect(re instanceof RegExp).toBe true
          expect('abc').toMatch re
          expect('aabc').not.toMatch re

        scope.search = '/^abc'
        scope.doSearch()

        expect(editor.filter).toHaveBeenCalled()


      it 'should not filter if search shorter than 3 characters', ->
        scope.search = '/'
        scope.doSearch()
        expect(editor.clearFilter).toHaveBeenCalled()
        editor.clearFilter.reset()

        scope.search = '/a'
        scope.doSearch()
        expect(editor.clearFilter).toHaveBeenCalled()
        editor.clearFilter.reset()

        scope.search = '/ab'
        scope.doSearch()
        expect(editor.clearFilter).toHaveBeenCalled()
        editor.clearFilter.reset()

        expect(editor.filter).not.toHaveBeenCalled()


      it 'should be case insensitive if only lower case search', ->
        editor.filter.andCallFake (re) ->
          expect('SoMeThInG').toMatch re

        scope.search = '/^some?thing$'
        scope.doSearch()
        expect(editor.filter).toHaveBeenCalled()


      it 'should be case sensitive if search contains upper case', ->
        editor.filter.andCallFake (re) ->
          expect('abc').not.toMatch re
          expect('AbC').toMatch re

        scope.search = '/AbC'
        scope.doSearch()
        expect(editor.filter).toHaveBeenCalled()


  describe 'enterSearch', ->

    describe 'goToLine', ->

      it 'should hide search', ->
        scope.search = ':123'
        scope.enterSearch()

        expect(scope.search).toBe ''
        expect(editor.clearFilter).toHaveBeenCalled()
        expect(editor.focus).toHaveBeenCalled()


    describe 'grep', ->

      it 'should goToFirstFiltered row and focus the editor', ->
        scope.search = '/something'
        scope.enterSearch()

        expect(editor.goToFirstFiltered).toHaveBeenCalled()
        expect(editor.focus).toHaveBeenCalled()


  describe 'events', ->
    broadcast = null

    beforeEach inject ($rootScope) ->
      broadcast = (event) ->
        $rootScope.$broadcast event


    describe 'escape', ->

      it 'should only hide search if visible', inject ($rootScope) ->
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
