mocks = angular.module 'mocks', []

mocks.value 'editor', {
  focus: -> jasmnie.createSpy 'focus',
  setSession: -> jasmnie.createSpy 'focus',
  clearSession: -> jasmnie.createSpy 'focus'
}

mocks.value 'EditSession', (content) -> @content = content

beforeEach module 'TD', 'mocks'