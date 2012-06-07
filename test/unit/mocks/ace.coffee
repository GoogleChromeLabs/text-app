# mocks.ace
mocks.ace.factory 'ace', ->
  ace = jasmine.createSpyObj 'ace', ['setTheme', 'setKeyboardHandler', 'setShowPrintMargin', 'focus']
  ace.setSession = (session) -> @_session = session
  ace.getSession = -> @_session
  ace
