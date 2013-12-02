minispade.register('ember-data/~tests/integration/all_test', "(function() {var get = Ember.get, set = Ember.set;\n\nvar Person, store, array, moreArray;\n\nmodule(\"integration/all - DS.Store#all()\", {\n  setup: function() {\n    array = [{ id: 1, name: \"Scumbag Dale\" }, { id: 2, name: \"Scumbag Katz\" }];\n    moreArray = [{ id: 3, name: \"Scumbag Bryn\" }];\n    Person = DS.Model.extend({ name: DS.attr('string') });\n\n    store = createStore({ person: Person });\n  },\n  teardown: function() {\n    store.destroy();\n    Person = null;\n    array = null;\n  }\n});\n\ntest(\"store.all('person') should return all records and should update with new ones\", function() {\n  store.pushMany('person', array);\n\n  var all = store.all('person');\n  equal(get(all, 'length'), 2);\n\n  store.pushMany('person', moreArray);\n\n  equal(get(all, 'length'), 3);\n});\n\n})();\n//@ sourceURL=ember-data/~tests/integration/all_test");