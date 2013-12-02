minispade.register('ember-data/~tests/unit/model/rollback_test', "(function() {var env, store, Person;\n\nmodule(\"unit/model/rollback - model.rollback()\", {\n  setup: function() {\n    Person = DS.Model.extend({\n      firstName: DS.attr(),\n      lastName: DS.attr()\n    });\n\n    env = setupStore({ person: Person });\n    store = env.store;\n  }\n});\n\ntest(\"changes to attributes can be rolled back\", function() {\n  var person = store.push('person', { id: 1, firstName: \"Tom\", lastName: \"Dale\" });\n\n  person.set('firstName', \"Thomas\");\n\n  equal(person.get('firstName'), \"Thomas\");\n\n  person.rollback();\n\n  equal(person.get('firstName'), \"Tom\");\n  equal(person.get('isDirty'), false);\n});\n\ntest(\"changes to attributes made after a record is in-flight only rolls back the local changes\", function() {\n  env.adapter.updateRecord = function(store, type, record) {\n    return Ember.RSVP.resolve();\n  };\n\n  var person = store.push('person', { id: 1, firstName: \"Tom\", lastName: \"Dale\" });\n\n  person.set('firstName', \"Thomas\");\n\n  // Make sure the save is async\n  Ember.run(function() {\n    var saving = person.save();\n\n    equal(person.get('firstName'), \"Thomas\");\n\n    person.set('lastName', \"Dolly\");\n\n    equal(person.get('lastName'), \"Dolly\");\n\n    person.rollback();\n\n    equal(person.get('firstName'), \"Thomas\");\n    equal(person.get('lastName'), \"Dale\");\n    equal(person.get('isSaving'), true);\n\n    saving.then(async(function() {\n      equal(person.get('isDirty'), false, \"The person is now clean\");\n    }));\n  });\n});\n\ntest(\"a record's changes can be made if it fails to save\", function() {\n  env.adapter.updateRecord = function(store, type, record) {\n    return Ember.RSVP.reject();\n  };\n\n  var person = store.push('person', { id: 1, firstName: \"Tom\", lastName: \"Dale\" });\n\n  person.set('firstName', \"Thomas\");\n\n  person.save().then(null, async(function() {\n    equal(person.get('isError'), true);\n\n    person.rollback();\n\n    equal(person.get('firstName'), \"Tom\");\n    equal(person.get('isError'), false);\n  }));\n});\n\ntest(\"new record can be rollbacked\", function() {\n  var person = store.createRecord('person', { id: 1 });\n\n  equal(person.get('isNew'), true, \"must be new\");\n  equal(person.get('isDirty'), true, \"must be dirty\");\n\n  person.rollback();\n\n  equal(person.get('isNew'), false, \"must not be new\");\n  equal(person.get('isDirty'), false, \"must not be dirty\");\n  equal(person.get('isDeleted'), true, \"must be deleted\");\n});\n\ntest(\"deleted record can be rollbacked\", function() {\n  var person = store.push('person', { id: 1 });\n\n  person.deleteRecord();\n\n  equal(person.get('isDeleted'), true, \"must be deleted\");\n\n  person.rollback();\n\n  equal(person.get('isDeleted'), false, \"must not be deleted\");\n  equal(person.get('isDirty'), false, \"must not be dirty\");\n});\n\n})();\n//@ sourceURL=ember-data/~tests/unit/model/rollback_test");