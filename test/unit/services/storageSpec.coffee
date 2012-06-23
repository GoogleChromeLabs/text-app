describe 'services storage', ->
  storage = chromeStorage = scope = watchedData = null

  beforeEach module 'mocks.storage'

  beforeEach inject (_chromeStorage_, _storage_, $rootScope) ->
    scope = $rootScope
    storage = _storage_
    chromeStorage = _chromeStorage_
    scope.$watch 'data', (data) -> watchedData = data


  it 'should $apply get callbacks', ->
    chromeStorage._data.some = 'new-data'
    storage.get ['some'], (data) -> scope.data = data.some
    chromeStorage._flush()

    expect(watchedData).toBe 'new-data'


  it 'should $apply set callbacks', ->
    data = some: 'data'
    storage.set data, -> scope.data = 'new-val'
    chromeStorage._flush()

    expect(watchedData).toBe 'new-val'
    expect(chromeStorage._data.some).toBe 'data'
