minispade.register('ember-data/~tests/integration/adapter/find_test', "(function() {var get = Ember.get, set = Ember.set;\nvar Person, store, adapter;\n\nmodule(\"integration/adapter/find - Finding Records\", {\n  setup: function() {\n    Person = DS.Model.extend({\n      updatedAt: DS.attr('string'),\n      name: DS.attr('string'),\n      firstName: DS.attr('string'),\n      lastName: DS.attr('string')\n    });\n  },\n\n  teardown: function() {\n    store.destroy();\n  }\n});\n\ntest(\"When a single record is requested, the adapter's find method should be called unless it's loaded.\", function() {\n  expect(2);\n\n  var count = 0;\n\n  store = createStore({ adapter: DS.Adapter.extend({\n      find: function(store, type, id) {\n        equal(type, Person, \"the find method is called with the correct type\");\n        equal(count, 0, \"the find method is only called once\");\n\n        count++;\n        return { id: 1, name: \"Braaaahm Dale\" };\n      }\n    })\n  });\n\n  store.find(Person, 1);\n  store.find(Person, 1);\n});\n\ntest(\"When a single record is requested multiple times, all .find() calls are resolved after the promise is resolved\", function() {\n  var deferred = Ember.RSVP.defer();\n\n  store = createStore({ adapter: DS.Adapter.extend({\n      find:  function(store, type, id) {\n        return deferred.promise;\n      }\n    })\n  });\n\n  store.find(Person, 1).then(async(function(person) {\n    equal(person.get('id'), \"1\");\n    equal(person.get('name'), \"Braaaahm Dale\");\n    equal(deferred.promise.isFulfilled, true);\n  }));\n\n  store.find(Person, 1).then(async(function(post) {\n    equal(post.get('id'), \"1\");\n    equal(post.get('name'), \"Braaaahm Dale\");\n    equal(deferred.promise.isFulfilled, true);\n  }));\n\n  Ember.run(function() {\n    deferred.resolve({ id: 1, name: \"Braaaahm Dale\" });\n  });\n});\n\ntest(\"When a single record is requested, and the promise is rejected, .find() is rejected.\", function() {\n  var count = 0;\n\n  store = createStore({ adapter: DS.Adapter.extend({\n      find: function(store, type, id) {\n        return Ember.RSVP.reject();\n      }\n    })\n  });\n\n  store.find(Person, 1).then(null, async(function(reason) {\n    ok(true, \"The rejection handler was called\");\n  }));\n});\n\n})();\n//@ sourceURL=ember-data/~tests/integration/adapter/find_test");