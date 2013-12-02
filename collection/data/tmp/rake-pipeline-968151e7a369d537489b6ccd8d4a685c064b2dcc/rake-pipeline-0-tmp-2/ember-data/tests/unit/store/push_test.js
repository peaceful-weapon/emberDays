minispade.register('ember-data/~tests/unit/store/push_test', "(function() {var env, store, Person, PhoneNumber, Post;\nvar attr = DS.attr, hasMany = DS.hasMany, belongsTo = DS.belongsTo;\n\nmodule(\"unit/store/push - DS.Store#push\", {\n  setup: function() {\n    Person = DS.Model.extend({\n      firstName: attr('string'),\n      lastName: attr('string'),\n      phoneNumbers: hasMany('phone-number')\n    });\n\n    PhoneNumber = DS.Model.extend({\n      number: attr('string'),\n      person: belongsTo('person')\n    });\n\n    Post = DS.Model.extend({\n      postTitle: attr('string')\n    });\n\n    env = setupStore({\"post\": Post,\n                      \"person\": Person,\n                      \"phone-number\": PhoneNumber});\n\n    store = env.store;\n\n    env.container.register('serializer:post', DS.ActiveModelSerializer);\n  },\n\n  teardown: function() {\n    Ember.run(function() {\n      store.destroy();\n    });\n  }\n});\n\ntest(\"Calling push with a normalized hash returns a record\", function() {\n  var person = store.push('person', {\n    id: 'wat',\n    firstName: \"Yehuda\",\n    lastName: \"Katz\"\n  });\n\n  store.find('person', 'wat').then(async(function(foundPerson) {\n    equal(foundPerson, person, \"record returned via load() is the same as the record returned from find()\");\n    deepEqual(foundPerson.getProperties('id', 'firstName', 'lastName'), {\n      id: 'wat',\n      firstName: \"Yehuda\",\n      lastName: \"Katz\"\n    });\n  }));\n});\n\ntest(\"Supplying a model class for `push` is the same as supplying a string\", function () {\n  var Programmer = Person.extend();\n  env.container.register('model:programmer', Programmer);\n\n  var programmer = store.push(Programmer, {\n    id: 'wat',\n    firstName: \"Yehuda\",\n    lastName: \"Katz\"\n  });\n\n  store.find('programmer', 'wat').then(async(function(foundProgrammer) {\n    deepEqual(foundProgrammer.getProperties('id', 'firstName', 'lastName'), {\n      id: 'wat',\n      firstName: \"Yehuda\",\n      lastName: \"Katz\"\n    });\n  }));\n});\n\ntest(\"Calling push triggers `didLoad` even if the record hasn't been requested from the adapter\", function() {\n  Person.reopen({\n    didLoad: async(function() {\n      ok(true, \"The didLoad callback was called\");\n    })\n  });\n\n  store.push('person', {\n    id: 'wat',\n    firstName: \"Yehuda\",\n    lastName: \"Katz\"\n  });\n});\n\ntest(\"Calling update with partial records updates just those attributes\", function() {\n  var person = store.push('person', {\n    id: 'wat',\n    firstName: \"Yehuda\",\n    lastName: \"Katz\"\n  });\n\n  store.update('person', {\n    id: 'wat',\n    lastName: \"Katz!\"\n  });\n\n  store.find('person', 'wat').then(async(function(foundPerson) {\n    equal(foundPerson, person, \"record returned via load() is the same as the record returned from find()\");\n    deepEqual(foundPerson.getProperties('id', 'firstName', 'lastName'), {\n      id: 'wat',\n      firstName: \"Yehuda\",\n      lastName: \"Katz!\"\n    });\n  }));\n});\n\ntest(\"Calling push with a normalized hash containing related records returns a record\", function() {\n  var number1 = store.push('phone-number', {\n    id: 1,\n    number: '5551212',\n    person: 'wat'\n  });\n\n  var number2 = store.push('phone-number', {\n    id: 2,\n    number: '5552121',\n    person: 'wat'\n  });\n\n  var person = store.push('person', {\n    id: 'wat',\n    firstName: 'John',\n    lastName: 'Smith',\n    phoneNumbers: [number1, number2]\n  });\n\n  deepEqual(person.get('phoneNumbers').toArray(), [ number1, number2 ], \"phoneNumbers array is correct\");\n});\n\ntest(\"Calling push with a normalized hash containing IDs of related records returns a record\", function() {\n  Person.reopen({\n    phoneNumbers: hasMany('phone-number', { async: true })\n  });\n\n  env.adapter.find = function(store, type, id) {\n    if (id === \"1\") {\n      return Ember.RSVP.resolve({\n        id: 1,\n        number: '5551212',\n        person: 'wat'\n      });\n    }\n\n    if (id === \"2\") {\n      return Ember.RSVP.resolve({\n        id: 2,\n        number: '5552121',\n        person: 'wat'\n      });\n    }\n  };\n\n  var person = store.push('person', {\n    id: 'wat',\n    firstName: 'John',\n    lastName: 'Smith',\n    phoneNumbers: [\"1\", \"2\"]\n  });\n\n  person.get('phoneNumbers').then(async(function(phoneNumbers) {\n    deepEqual(phoneNumbers.map(function(item) {\n      return item.getProperties('id', 'number', 'person');\n    }), [{\n      id: \"1\",\n      number: '5551212',\n      person: person\n    }, {\n      id: \"2\",\n      number: '5552121',\n      person: person\n    }]);\n  }));\n});\n\ntest(\"Calling pushPayload allows pushing raw JSON\", function () {\n  store.pushPayload('post', {posts: [{\n    id: '1',\n    post_title: \"Ember rocks\"\n  }]});\n\n  var post = store.getById('post', 1);\n\n  equal(post.get('postTitle'), \"Ember rocks\", \"you can push raw JSON into the store\");\n\n  store.pushPayload('post', {posts: [{\n    id: '1',\n    post_title: \"Ember rocks (updated)\"\n  }]});\n\n  equal(post.get('postTitle'), \"Ember rocks (updated)\", \"You can update data in the store\");\n});\n\n})();\n//@ sourceURL=ember-data/~tests/unit/store/push_test");