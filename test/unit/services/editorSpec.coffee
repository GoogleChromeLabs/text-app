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

      settings.useSoftTabs = true
      expect(session.setUseSoftTabs).toHaveBeenCalledWith true

      settings.useSoftTabs = false
      expect(session.setUseSoftTabs).toHaveBeenCalledWith false


    it 'should change tab size on current session', inject (EditSession) ->
      session = new EditSession ''
      ace.setSession session

      settings.tabSize = 4
      expect(session.setTabSize).toHaveBeenCalledWith 4


    it 'should change softWrap on current session', inject (EditSession) ->
      session = new EditSession ''
      ace.setSession session

      settings.softWrap = -1 # off
      expect(session.setUseWrapMode).toHaveBeenCalledWith false
      session.reset()

      settings.softWrap = 0 # free
      expect(session.setUseWrapMode).toHaveBeenCalledWith true
      expect(session.setWrapLimitRange).toHaveBeenCalledWith null, null
      session.reset()

      settings.softWrap = 80
      expect(session.setUseWrapMode).toHaveBeenCalledWith true
      expect(session.setWrapLimitRange).toHaveBeenCalledWith 80, 80


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
      settings.useSoftTabs = true
      settings.tabSize = 20
      settings.softWrap = 80
      editor.setSession session

      expect(session.setUseSoftTabs).toHaveBeenCalledWith true
      expect(session.setTabSize).toHaveBeenCalledWith 20
      expect(session.setUseWrapMode).toHaveBeenCalledWith true
      expect(session.setWrapLimitRange).toHaveBeenCalledWith 80, 80
