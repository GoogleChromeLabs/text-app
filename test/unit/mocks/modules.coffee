mocks =
  common: angular.module('mocks', ['mocks.editor', 'mocks.storage', 'mocks.classes'])
  editor: angular.module('mocks.editor', [])
  ace: angular.module('mocks.ace', [])
  storage: angular.module('mocks.storage', [])
  classes: angular.module('mocks.classes', [])
  log: angular.module('mocks.log', [])


# load the app and log mock before every spec
beforeEach module 'TD.app', 'mocks.log'
