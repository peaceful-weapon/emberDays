minispade.register('ember-data/~tests/unit/model/lifecycle_callbacks_test', "(function() {var get = Ember.get, set = Ember.set;\n\nmodule(\"unit/model/lifecycle_callbacks - Lifecycle Callbacks\");\n\ntest(\"a record receives a didLoad callback when it has finished loading\", function() {\n  var Person = DS.Model.extend({\n    name: DS.attr(),\n    didLoad: function() {\n      ok(\"The didLoad callback was called\");\n    }\n  });\n\n  var adapter = DS.Adapter.extend({\n    find: function(store, type, id) {\n      return Ember.RSVP.resolve({ id: 1, name: \"Foo\" });\n    }\n  });\n\n  var store = createStore({\n    adapter: adapter\n  });\n\n  store.find(Person, 1).then(async(function(person) {\n    equal(person.get('id'), \"1\", \"The person's ID is available\");\n    equal(person.get('name'), \"Foo\", \"The person's properties are available\");\n  }));\n});\n\ntest(\"a record receives a didUpdate callback when it has finished updating\", function() {\n  var callCount = 0;\n\n  var Person = DS.Model.extend({\n    bar: DS.attr('string'),\n\n    didUpdate: function() {\n      callCount++;\n      equal(get(this, 'isSaving'), false, \"record should be saving\");\n      equal(get(this, 'isDirty'), false, \"record should not be dirty\");\n    }\n  });\n\n  var adapter = DS.Adapter.extend({\n    find: function(store, type, id) {\n      return Ember.RSVP.resolve({ id: 1, name: \"Foo\" });\n    },\n\n    updateRecord: function(store, type, record) {\n      equal(callCount, 0, \"didUpdate callback was not called until didSaveRecord is called\");\n\n      return Ember.RSVP.resolve();\n    }\n  });\n\n  var store = createStore({\n    adapter: adapter\n  });\n\n  var asyncPerson = store.find(Person, 1);\n  equal(callCount, 0, \"precond - didUpdate callback was not called yet\");\n\n  asyncPerson.then(async(function(person) {\n    person.set('bar', \"Bar\");\n    return person.save();\n  })).then(async(function() {\n    equal(callCount, 1, \"didUpdate called after update\");\n  }));\n});\n\ntest(\"a record receives a didCreate callback when it has finished updating\", function() {\n  var callCount = 0;\n\n  var Person = DS.Model.extend({\n    didCreate: function() {\n      callCount++;\n      equal(get(this, 'isSaving'), false, \"record should not be saving\");\n      equal(get(this, 'isDirty'), false, \"record should not be dirty\");\n    }\n  });\n\n  var adapter = DS.Adapter.extend({\n    createRecord: function(store, type, record) {\n      equal(callCount, 0, \"didCreate callback was not called until didSaveRecord is called\");\n\n      return Ember.RSVP.resolve();\n    }\n  });\n\n  var store = createStore({\n    adapter: adapter\n  });\n\n  equal(callCount, 0, \"precond - didCreate callback was not called yet\");\n\n  var person = store.createRecord(Person, { id: 69, name: \"Newt Gingrich\" });\n\n  person.save().then(async(function() {\n    equal(callCount, 1, \"didCreate called after commit\");\n  }));\n});\n\ntest(\"a record receives a didDelete callback when it has finished deleting\", function() {\n  var callCount = 0;\n\n  var Person = DS.Model.extend({\n    bar: DS.attr('string'),\n\n    didDelete: function() {\n      callCount++;\n\n      equal(get(this, 'isSaving'), false, \"record should not be saving\");\n      equal(get(this, 'isDirty'), false, \"record should not be dirty\");\n    }\n  });\n\n  var adapter = DS.Adapter.extend({\n    find: function(store, type, id) {\n      return Ember.RSVP.resolve({ id: 1, name: \"Foo\" });\n    },\n\n    deleteRecord: function(store, type, record) {\n      equal(callCount, 0, \"didDelete callback was not called until didSaveRecord is called\");\n\n      return Ember.RSVP.resolve();\n    }\n  });\n\n  var store = createStore({\n    adapter: adapter\n  });\n\n  var asyncPerson = store.find(Person, 1);\n  equal(callCount, 0, \"precond - didDelete callback was not called yet\");\n\n  asyncPerson.then(async(function(person) {\n    person.deleteRecord();\n    return person.save();\n  })).then(async(function() {\n    equal(callCount, 1, \"didDelete called after delete\");\n  }));\n});\n\ntest(\"a record receives a becameInvalid callback when it became invalid\", function() {\n  var callCount = 0;\n\n  var Person = DS.Model.extend({\n    bar: DS.attr('string'),\n\n    becameInvalid: function() {\n      callCount++;\n\n      equal(get(this, 'isSaving'), false, \"record should not be saving\");\n      equal(get(this, 'isDirty'), true, \"record should be dirty\");\n    }\n  });\n\n  var adapter = DS.Adapter.extend({\n    find: function(store, type, id) {\n      return Ember.RSVP.resolve({ id: 1, name: \"Foo\" });\n    },\n\n    updateRecord: function(store, type, record) {\n      equal(callCount, 0, \"becameInvalid callback was not called untill recordWasInvalid is called\");\n\n      return Ember.RSVP.reject(new DS.InvalidError({ bar: 'error' }));\n    }\n  });\n\n  var store = createStore({\n    adapter: adapter\n  });\n\n  var asyncPerson = store.find(Person, 1);\n  equal(callCount, 0, \"precond - becameInvalid callback was not called yet\");\n\n  // Make sure that the error handler has a chance to attach before\n  // save fails.\n  Ember.run(function() {\n    asyncPerson.then(async(function(person) {\n      person.set('bar', \"Bar\");\n      return person.save();\n    })).then(null, async(function() {\n      equal(callCount, 1, \"becameInvalid called after invalidating\");\n    }));\n  });\n});\n\ntest(\"an ID of 0 is allowed\", function() {\n  var store = createStore();\n\n  var Person = DS.Model.extend({\n    name: DS.attr('string')\n  });\n\n  store.push(Person, { id: 0, name: \"Tom Dale\" });\n  equal(store.all(Person).objectAt(0).get('name'), \"Tom Dale\", \"found record with id 0\");\n});\n\n})();\n//@ sourceURL=ember-data/~tests/unit/model/lifecycle_callbacks_test");