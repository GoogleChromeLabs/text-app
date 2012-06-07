# mocks.editor
mocks.editor.factory 'editor', ->
  focus: jasmine.createSpy 'focus'
  setSession: jasmine.createSpy 'focus'
  clearSession: jasmine.createSpy 'focus'
  setTheme: jasmine.createSpy 'setTheme'
  setKeyboardHandler: jasmine.createSpy 'setKeyboardHandler'