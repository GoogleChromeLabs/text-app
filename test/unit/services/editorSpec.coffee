describe 'services.editor', ->
  editor = ace = settings = null

  beforeEach module 'mocks.classes', 'mocks.ace', 'mocks.storage'

  beforeEach inject (_settings_, _editor_, _ace_) ->
    editor = _editor_
    settings = _settings_
    ace = _ace_


  # syncing when settings change
  describe 'settings', ->

    it 'should change theme', ->
      settings.theme = id: 'fake-theme'
      expect(ace.setTheme).toHaveBeenCalledWith 'fake-theme'


    it 'should change keyboard handler', ->
      settings.keyMode = handler: 'fake-handler'
      expect(ace.setKeyboardHandler).toHaveBeenCalledWith 'fake-handler'


    it 'should change soft tabs on current session', inject (EditSession) ->
      session = new EditSession ''
      ace.setSession session

      settings.softTabs = 6
      expect(session.setUseSoftTabs).toHaveBeenCalledWith true
      expect(session.setTabSize).toHaveBeenCalledWith 6

      settings.softTabs = -1
      expect(session.setUseSoftTabs).toHaveBeenCalledWith false
      expect(session.setTabSize).toHaveBeenCalledWith 4


    it 'should change softWrap on current session', inject (EditSession) ->
      session = new EditSession ''
      ace.setSession session

      settings.softWrap = -1 # off
      expect(session.setUseWrapMode).toHaveBeenCalledWith false
      expect(ace.setShowPrintMargin).toHaveBeenCalledWith false
      session.reset()

      settings.softWrap = 0 # free
      expect(session.setUseWrapMode).toHaveBeenCalledWith true
      expect(session.setWrapLimitRange).toHaveBeenCalledWith null, null
      expect(ace.setShowPrintMargin).toHaveBeenCalledWith false
      session.reset()

      settings.softWrap = 80
      expect(session.setUseWrapMode).toHaveBeenCalledWith true
      expect(session.setWrapLimitRange).toHaveBeenCalledWith 80, 80
      expect(ace.setShowPrintMargin).toHaveBeenCalledWith true
      expect(ace.setPrintMarginColumn).toHaveBeenCalledWith 80


  describe 'setSession', ->
    session = null

    beforeEach inject (EditSession) ->
      ace._session = new EditSession ''
      session = new EditSession ''


    it 'should set the session to ace editor', ->
      spyOn ace, 'setSession'
      editor.setSession session
      expect(ace.setSession).toHaveBeenCalledWith session


    it 'should apply current config on the session', ->
      settings.softTabs = 4
      settings.softWrap = 80
      editor.setSession session

      expect(session.setUseSoftTabs).toHaveBeenCalledWith true
      expect(session.setTabSize).toHaveBeenCalledWith 4
      expect(session.setUseWrapMode).toHaveBeenCalledWith true
      expect(session.setWrapLimitRange).toHaveBeenCalledWith 80, 80


    it 'should make the editor editable', ->
      editor.setSession session
      expect(ace.setReadOnly).toHaveBeenCalledWith false


  describe 'clearSession', ->

    it 'should set clear session and disable editting', inject (EditSession) ->
      ace._session = new EditSession 'something'
      editor.clearSession()

      expect(ace.setReadOnly).toHaveBeenCalledWith true
      expect(ace._session.content).toBe ''


  describe 'filtering', ->
    log = null

    beforeEach inject (EditSession) ->
      log = []
      session = ace._session = new EditSession
      session.unfold.andCallFake -> log.push 'unfold'
      session.$setFolding.andCallFake -> log.push '$setFolding'
      session.foldAll.andCallFake -> log.push 'foldAll'


    it 'should unfold, setFolding and fold', inject (EditSession) ->
      editor.filter /something/
      expect(log).toEqual ['unfold', '$setFolding', 'foldAll']


    it 'should do nothing if not filtered', ->
      editor.clearFilter()
      expect(log).toEqual []


    it 'should unfold and set folding to null', ->
      editor.filter /abc/
      log.length = 0

      editor.clearFilter()
      expect(log).toEqual ['unfold', '$setFolding']
      expect(ace._session.$setFolding).toHaveBeenCalledWith null
      log.length = 0

      editor.clearFilter()
      expect(log).toEqual []


  describe 'FilterFolding', ->
    folding = EditSession = null

    beforeEach inject (FilterFolding) ->
      folding = new FilterFolding /^abc?/


    describe 'getFoldWidget', ->

      it 'should return start', inject (EditSession) ->
        # start with no match
        session = new EditSession 'one\ntwo\nabc\nthree'
        expect(folding.getFoldWidget session, null, 0).toBe 'start'
        expect(folding.getFoldWidget session, null, 1).toBe ''
        expect(folding.getFoldWidget session, null, 2).toBe ''
        expect(folding.getFoldWidget session, null, 3).toBe 'start'

        # start with match
        session = new EditSession 'abc\none\nabc\nthree'
        expect(folding.getFoldWidget session, null, 0).toBe ''
        expect(folding.getFoldWidget session, null, 1).toBe 'start'
        expect(folding.getFoldWidget session, null, 2).toBe ''
        expect(folding.getFoldWidget session, null, 3).toBe 'start'


    describe 'getFoldWidgetRange', ->

      it 'should return range', inject (EditSession) ->
        session = new EditSession 'one\ntwo\nabc\nthree'

        range = folding.getFoldWidgetRange session, null, 0
        expect(range.start.row).toBe 0
        expect(range.start.column).toBe 0
        expect(range.end.row).toBe 1
        expect(range.end.column).toBe 3

        range = folding.getFoldWidgetRange session, null, 3
        expect(range.start.row).toBe 3
        expect(range.start.column).toBe 0
        expect(range.end.row).toBe 3
        expect(range.end.column).toBe 5
