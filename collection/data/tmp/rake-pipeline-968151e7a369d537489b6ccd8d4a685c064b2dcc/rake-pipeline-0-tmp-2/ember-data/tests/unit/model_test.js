minispade.register('ember-data/~tests/unit/model_test', "(function() {var get = Ember.get, set = Ember.set;\n\nvar Person, store, array;\n\nmodule(\"unit/model - DS.Model\", {\n  setup: function() {\n    store = createStore();\n\n    Person = DS.Model.extend({\n      name: DS.attr('string'),\n      isDrugAddict: DS.attr('boolean')\n    });\n  },\n\n  teardown: function() {\n    Person = null;\n    store = null;\n  }\n});\n\ntest(\"can have a property set on it\", function() {\n  var record = store.createRecord(Person);\n  set(record, 'name', 'bar');\n\n  equal(get(record, 'name'), 'bar', \"property was set on the record\");\n});\n\ntest(\"setting a property on a record that has not changed does not cause it to become dirty\", function() {\n  store.push(Person, { id: 1, name: \"Peter\", isDrugAddict: true });\n  store.find(Person, 1).then(async(function(person) {\n    equal(person.get('isDirty'), false, \"precond - person record should not be dirty\");\n    person.set('name', \"Peter\");\n    person.set('isDrugAddict', true);\n    equal(person.get('isDirty'), false, \"record does not become dirty after setting property to old value\");\n  }));\n});\n\ntest(\"resetting a property on a record cause it to become clean again\", function() {\n  store.push(Person, { id: 1, name: \"Peter\", isDrugAddict: true });\n  store.find(Person, 1).then(async(function(person) {\n    equal(person.get('isDirty'), false, \"precond - person record should not be dirty\");\n    person.set('isDrugAddict', false);\n    equal(person.get('isDirty'), true, \"record becomes dirty after setting property to a new value\");\n    person.set('isDrugAddict', true);\n    equal(person.get('isDirty'), false, \"record becomes clean after resetting property to the old value\");\n  }));\n});\n\ntest(\"a record reports its unique id via the `id` property\", function() {\n  store.push(Person, { id: 1 });\n\n  store.find(Person, 1).then(async(function(record) {\n    equal(get(record, 'id'), 1, \"reports id as id by default\");\n  }));\n});\n\ntest(\"a record's id is included in its toString representation\", function() {\n  store.push(Person, { id: 1 });\n\n  store.find(Person, 1).then(async(function(record) {\n    equal(record.toString(), '<(subclass of DS.Model):'+Ember.guidFor(record)+':1>', \"reports id in toString\");\n  }));\n});\n\ntest(\"trying to set an `id` attribute should raise\", function() {\n  Person = DS.Model.extend({\n    id: DS.attr('number'),\n    name: \"Scumdale\"\n  });\n\n  expectAssertion(function() {\n    store.push(Person, { id: 1, name: \"Scumdale\" });\n    var person = store.find(Person, 1);\n  }, /You may not set `id`/);\n});\n\ntest(\"it should use `_reference` and not `reference` to store its reference\", function() {\n  store.push(Person, { id: 1 });\n\n  store.find(Person, 1).then(async(function(record) {\n    equal(record.get('reference'), undefined, \"doesn't shadow reference key\");\n  }));\n});\n\ntest(\"it should cache attributes\", function() {\n  var store = createStore();\n\n  var Post = DS.Model.extend({\n    updatedAt: DS.attr('string')\n  });\n\n  var dateString = \"Sat, 31 Dec 2011 00:08:16 GMT\";\n  var date = new Date(dateString);\n\n  store.push(Post, { id: 1 });\n\n  store.find(Post, 1).then(async(function(record) {\n    record.set('updatedAt', date);\n    deepEqual(date, get(record, 'updatedAt'), \"setting a date returns the same date\");\n    strictEqual(get(record, 'updatedAt'), get(record, 'updatedAt'), \"second get still returns the same object\");\n  }));\n});\n\nmodule(\"unit/model - DS.Model updating\", {\n  setup: function() {\n    array = [{ id: 1, name: \"Scumbag Dale\" }, { id: 2, name: \"Scumbag Katz\" }, { id: 3, name: \"Scumbag Bryn\" }];\n    Person = DS.Model.extend({ name: DS.attr('string') });\n    store = createStore();\n    store.pushMany(Person, array);\n  },\n  teardown: function() {\n    Person = null;\n    store = null;\n    array = null;\n  }\n});\n\ntest(\"a DS.Model can update its attributes\", function() {\n  store.find(Person, 2).then(async(function(person) {\n    set(person, 'name', \"Brohuda Katz\");\n    equal(get(person, 'name'), \"Brohuda Katz\", \"setting took hold\");\n  }));\n});\n\ntest(\"a DS.Model can have a defaultValue\", function() {\n  var Tag = DS.Model.extend({\n    name: DS.attr('string', { defaultValue: \"unknown\" })\n  });\n\n  var tag = store.createRecord(Tag);\n\n  equal(get(tag, 'name'), \"unknown\", \"the default value is found\");\n\n  set(tag, 'name', null);\n\n  equal(get(tag, 'name'), null, \"null doesn't shadow defaultValue\");\n});\n\ntest(\"a defaultValue for an attribite can be a function\", function() {\n  var Tag = DS.Model.extend({\n    createdAt: DS.attr('string', {\n      defaultValue: function() {\n        return \"le default value\";\n      }\n    })\n  });\n\n  var tag = store.createRecord(Tag);\n  equal(get(tag, 'createdAt'), \"le default value\", \"the defaultValue function is evaluated\");\n});\n\ntest(\"when a DS.Model updates its attributes, its changes affect its filtered Array membership\", function() {\n  var people = store.filter(Person, function(hash) {\n    if (hash.get('name').match(/Katz$/)) { return true; }\n  });\n\n  equal(get(people, 'length'), 1, \"precond - one item is in the RecordArray\");\n\n  var person = people.objectAt(0);\n\n  equal(get(person, 'name'), \"Scumbag Katz\", \"precond - the item is correct\");\n\n  set(person, 'name', \"Yehuda Katz\");\n\n  equal(get(people, 'length'), 1, \"there is still one item\");\n  equal(get(person, 'name'), \"Yehuda Katz\", \"it has the updated item\");\n\n  set(person, 'name', \"Yehuda Katz-Foo\");\n\n  equal(get(people, 'length'), 0, \"there are now no items\");\n});\n\nmodule(\"unit/model - with a simple Person model\", {\n  setup: function() {\n    array = [{ id: 1, name: \"Scumbag Dale\" }, { id: 2, name: \"Scumbag Katz\" }, { id: 3, name: \"Scumbag Bryn\" }];\n    Person = DS.Model.extend({\n      name: DS.attr('string')\n    });\n    store = createStore();\n    store.pushMany(Person, array);\n  },\n  teardown: function() {\n    Person = null;\n    store = null;\n    array = null;\n  }\n});\n\ntest(\"when a DS.Model updates its attributes, its changes affect its filtered Array membership\", function() {\n  var people = store.filter(Person, function(hash) {\n    if (hash.get('name').match(/Katz$/)) { return true; }\n  });\n\n  equal(get(people, 'length'), 1, \"precond - one item is in the RecordArray\");\n\n  var person = people.objectAt(0);\n\n  equal(get(person, 'name'), \"Scumbag Katz\", \"precond - the item is correct\");\n\n  set(person, 'name', \"Yehuda Katz\");\n\n  equal(get(people, 'length'), 1, \"there is still one item\");\n  equal(get(person, 'name'), \"Yehuda Katz\", \"it has the updated item\");\n\n  set(person, 'name', \"Yehuda Katz-Foo\");\n\n  equal(get(people, 'length'), 0, \"there are now no items\");\n});\n\ntest(\"can ask if record with a given id is loaded\", function() {\n  equal(store.recordIsLoaded(Person, 1), true, 'should have person with id 1');\n  equal(store.recordIsLoaded(Person, 4), false, 'should not have person with id 2');\n});\n\ntest(\"a listener can be added to a record\", function() {\n  var count = 0;\n  var F = function() { count++; };\n  var record = store.createRecord(Person);\n\n  record.on('event!', F);\n  record.trigger('event!');\n\n  equal(count, 1, \"the event was triggered\");\n\n  record.trigger('event!');\n\n  equal(count, 2, \"the event was triggered\");\n});\n\ntest(\"when an event is triggered on a record the method with the same name is invoked with arguments\", function(){\n  var count = 0;\n  var F = function() { count++; };\n  var record = store.createRecord(Person);\n\n  record.eventNamedMethod = F;\n\n  record.trigger('eventNamedMethod');\n\n  equal(count, 1, \"the corresponding method was called\");\n});\n\ntest(\"when a method is invoked from an event with the same name the arguments are passed through\", function(){\n  var eventMethodArgs = null;\n  var F = function() { eventMethodArgs = arguments; };\n  var record = store.createRecord(Person);\n\n  record.eventThatTriggersMethod = F;\n\n  record.trigger('eventThatTriggersMethod', 1, 2);\n\n  equal( eventMethodArgs[0], 1);\n  equal( eventMethodArgs[1], 2);\n});\n\nvar converts = function(type, provided, expected) {\n  var Model = DS.Model.extend({\n    name: DS.attr(type)\n  });\n\n  var container = new Ember.Container();\n\n  var testStore = createStore({model: Model}),\n      serializer = DS.JSONSerializer.create({ store: testStore, container: container });\n\n  testStore.push(Model, serializer.normalize(Model, { id: 1, name: provided }));\n  testStore.push(Model, serializer.normalize(Model, { id: 2 }));\n\n  testStore.find('model', 1).then(async(function(record) {\n    deepEqual(get(record, 'name'), expected, type + \" coerces \" + provided + \" to \" + expected);\n  }));\n\n  // See: Github issue #421\n  // record = testStore.find(Model, 2);\n  // set(record, 'name', provided);\n  // deepEqual(get(record, 'name'), expected, type + \" coerces \" + provided + \" to \" + expected);\n};\n\nvar convertsFromServer = function(type, provided, expected) {\n  var Model = DS.Model.extend({\n    name: DS.attr(type)\n  });\n\n  var container = new Ember.Container();\n\n  var testStore = createStore({model: Model}),\n      serializer = DS.JSONSerializer.create({ store: testStore, container: container });\n\n  testStore.push(Model, serializer.normalize(Model, { id: \"1\", name: provided }));\n  testStore.find('model', 1).then(async(function(record) {\n    deepEqual(get(record, 'name'), expected, type + \" coerces \" + provided + \" to \" + expected);\n  }));\n};\n\nvar convertsWhenSet = function(type, provided, expected) {\n  var Model = DS.Model.extend({\n    name: DS.attr(type)\n  });\n\n  var testStore = createStore({model: Model});\n\n  testStore.push(Model, { id: 2 });\n  var record = testStore.find('model', 2).then(async(function(record) {\n    set(record, 'name', provided);\n    deepEqual(record.serialize().name, expected, type + \" saves \" + provided + \" as \" + expected);\n  }));\n};\n\ntest(\"a DS.Model can describe String attributes\", function() {\n  converts('string', \"Scumbag Tom\", \"Scumbag Tom\");\n  converts('string', 1, \"1\");\n  converts('string', \"\", \"\");\n  converts('string', null, null);\n  converts('string', undefined, null);\n  convertsFromServer('string', undefined, null);\n});\n\ntest(\"a DS.Model can describe Number attributes\", function() {\n  converts('number', \"1\", 1);\n  converts('number', \"0\", 0);\n  converts('number', 1, 1);\n  converts('number', 0, 0);\n  converts('number', \"\", null);\n  converts('number', null, null);\n  converts('number', undefined, null);\n  converts('number', true, 1);\n  converts('number', false, 0);\n});\n\ntest(\"a DS.Model can describe Boolean attributes\", function() {\n  converts('boolean', \"1\", true);\n  converts('boolean', \"\", false);\n  converts('boolean', 1, true);\n  converts('boolean', 0, false);\n  converts('boolean', null, false);\n  converts('boolean', true, true);\n  converts('boolean', false, false);\n});\n\ntest(\"a DS.Model can describe Date attributes\", function() {\n  converts('date', null, null);\n  converts('date', undefined, undefined);\n\n  var dateString = \"Sat, 31 Dec 2011 00:08:16 GMT\";\n  var date = new Date(dateString);\n\n  var store = createStore();\n\n  var Person = DS.Model.extend({\n    updatedAt: DS.attr('date')\n  });\n\n  store.push(Person, { id: 1 });\n  store.find(Person, 1).then(async(function(record) {\n    record.set('updatedAt', date);\n    deepEqual(date, get(record, 'updatedAt'), \"setting a date returns the same date\");\n  }));\n\n  convertsFromServer('date', dateString, date);\n  convertsWhenSet('date', date, dateString);\n});\n\ntest(\"don't allow setting\", function(){\n  var store = createStore();\n\n  var Person = DS.Model.extend();\n  var record = store.createRecord(Person);\n\n  raises(function(){\n    record.set('isLoaded', true);\n  }, \"raised error when trying to set an unsettable record\");\n});\n\ntest(\"ensure model exits loading state, materializes data and fulfills promise only after data is available\", function () {\n  var store = createStore({\n    adapter: DS.Adapter.extend({\n      find: function(store, type, id) {\n        return Ember.RSVP.resolve({ id: 1, name: \"John\", isDrugAddict: false });\n      }\n    })\n  });\n\n  store.find(Person, 1).then(async(function(person) {\n    equal(get(person, 'currentState.stateName'), 'root.loaded.saved', 'model is in loaded state');\n    equal(get(person, 'isLoaded'), true, 'model is loaded');\n  }));\n});\n\ntest(\"A DS.Model can be JSONified\", function() {\n  var Person = DS.Model.extend({\n    name: DS.attr('string')\n  });\n\n  var store = createStore({ person: Person });\n  var record = store.createRecord('person', { name: \"TomHuda\" });\n  deepEqual(record.toJSON(), { name: \"TomHuda\" });\n});\n\n})();\n//@ sourceURL=ember-data/~tests/unit/model_test");