minispade.register('ember-data/~tests/unit/debug_test', "(function() {var get = Ember.get, set = Ember.set;\n\nvar store;\n\nvar TestAdapter = DS.Adapter.extend();\n\nmodule(\"Debug\", {\n  setup: function() {\n    store = DS.Store.create({\n      adapter: TestAdapter.extend()\n    });\n  },\n\n  teardown: function() {\n    store.destroy();\n    store = null;\n  }\n});\n\ntest(\"_debugInfo groups the attributes and relationships correctly\", function() {\n  var MaritalStatus = DS.Model.extend({\n    name: DS.attr('string')\n  });\n\n  var Post = DS.Model.extend({\n    title: DS.attr('string')\n  });\n\n  var User = DS.Model.extend({\n    name: DS.attr('string'),\n    isDrugAddict: DS.attr('boolean'),\n    maritalStatus: DS.belongsTo(MaritalStatus),\n    posts: DS.hasMany(Post)\n  });\n\n  var record = store.createRecord(User);\n\n  var propertyInfo = record._debugInfo().propertyInfo;\n\n  equal(propertyInfo.groups.length, 4);\n  deepEqual(propertyInfo.groups[0].properties, ['id', 'name', 'isDrugAddict']);\n  deepEqual(propertyInfo.groups[1].properties, ['maritalStatus']);\n  deepEqual(propertyInfo.groups[2].properties, ['posts']);\n});\n\n})();\n//@ sourceURL=ember-data/~tests/unit/debug_test");