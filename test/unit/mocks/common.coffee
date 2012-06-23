mocks.common.value 'focus', jasmine.createSpy 'focus'

mocks.common.factory 'appWindow', ->
  win = jasmine.createSpyObj 'appWindow', ['close', 'maximize', 'restore']
  win._resetAllSpies = ->
    @close.reset()
    @maximize.reset()
    @restore.reset()
  win
