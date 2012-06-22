# mocks.editor
mocks.editor.config ($provide) ->
  $provide.decorator 'editor', ($delegate) ->
    # spy on all methods
    angular.forEach $delegate, (property, key) ->
      spyOn $delegate, key if angular.isFunction property
