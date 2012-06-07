# mocks.storage
# mock version of chrome.storage.local
# http://code.google.com/chrome/extensions/trunk/storage.html
mocks.storage.factory 'chromeStorage', ->
  _data: {}
  _queue: []

  set: (data, fn) ->
    angular.extend(@_data, data)
    @_queue.push fn

  get: (keys, fn) ->
    # TODO(vojta): accept null and string as keys
    result = {}
    data = @_data
    keys.forEach (key) ->
      result[key] = data[key]

    @_queue.push ->
      fn result

  _flush: ->
    while @_queue.length
      @_queue.shift()()
    undefined