minispade.register('activemodel-adapter/~tests/integration/active_model_serializer_test', "(function() {var get = Ember.get, set = Ember.set;\nvar HomePlanet, league, SuperVillain, superVillain, EvilMinion, YellowMinion, DoomsdayDevice, PopularVillain, Comment, Course, Unit, env;\n\nmodule(\"integration/active_model - ActiveModelSerializer\", {\n  setup: function() {\n    SuperVillain = DS.Model.extend({\n      firstName:     DS.attr('string'),\n      lastName:      DS.attr('string'),\n      homePlanet:    DS.belongsTo(\"homePlanet\"),\n      evilMinions:   DS.hasMany(\"evilMinion\")\n    });\n    HomePlanet = DS.Model.extend({\n      name:          DS.attr('string'),\n      villains:      DS.hasMany('superVillain')\n    });\n    EvilMinion = DS.Model.extend({\n      superVillain: DS.belongsTo('superVillain'),\n      name:         DS.attr('string')\n    });\n    YellowMinion = EvilMinion.extend();\n    DoomsdayDevice = DS.Model.extend({\n      name:         DS.attr('string'),\n      evilMinion:   DS.belongsTo('evilMinion', {polymorphic: true})\n    });\n    PopularVillain = DS.Model.extend({\n      name:         DS.attr('string'),\n      evilMinions:  DS.hasMany('evilMinion', {polymorphic: true})\n    });\n    Comment = DS.Model.extend({\n      body: DS.attr('string'),\n      root: DS.attr('boolean'),\n      children: DS.hasMany('comment')\n    });\n    Course = DS.Model.extend({\n      name: DS.attr('string'),\n      prerequisiteUnits: DS.hasMany('unit'),\n      units: DS.hasMany('unit')\n    });\n    Unit = DS.Model.extend({\n      name: DS.attr('string')\n    });\n    env = setupStore({\n      superVillain:   SuperVillain,\n      homePlanet:     HomePlanet,\n      evilMinion:     EvilMinion,\n      yellowMinion:   YellowMinion,\n      doomsdayDevice: DoomsdayDevice,\n      popularVillain: PopularVillain,\n      comment:        Comment,\n      course:         Course,\n      unit:           Unit\n    });\n    env.store.modelFor('superVillain');\n    env.store.modelFor('homePlanet');\n    env.store.modelFor('evilMinion');\n    env.store.modelFor('yellowMinion');\n    env.store.modelFor('doomsdayDevice');\n    env.store.modelFor('popularVillain');\n    env.store.modelFor('comment');\n    env.store.modelFor('course');\n    env.store.modelFor('unit');\n    env.container.register('serializer:application', DS.ActiveModelSerializer);\n    env.container.register('serializer:ams', DS.ActiveModelSerializer);\n    env.container.register('adapter:ams', DS.ActiveModelAdapter);\n    env.amsSerializer = env.container.lookup(\"serializer:ams\");\n    env.amsAdapter    = env.container.lookup(\"adapter:ams\");\n  },\n\n  teardown: function() {\n    env.store.destroy();\n  }\n});\n\ntest(\"serialize\", function() {\n  league = env.store.createRecord(HomePlanet, { name: \"Villain League\", id: \"123\" });\n  var tom           = env.store.createRecord(SuperVillain, { firstName: \"Tom\", lastName: \"Dale\", homePlanet: league });\n\n  var json = env.amsSerializer.serialize(tom);\n\n  deepEqual(json, {\n    first_name:       \"Tom\",\n    last_name:        \"Dale\",\n    home_planet_id: get(league, \"id\")\n  });\n});\n\ntest(\"serializeIntoHash\", function() {\n  league = env.store.createRecord(HomePlanet, { name: \"Umber\", id: \"123\" });\n  var json = {};\n\n  env.amsSerializer.serializeIntoHash(json, HomePlanet, league);\n\n  deepEqual(json, {\n    home_planet: {\n      name:   \"Umber\"\n    }\n  });\n});\n\ntest(\"normalize\", function() {\n  var superVillain_hash = {first_name: \"Tom\", last_name: \"Dale\", home_planet_id: \"123\", evil_minion_ids: [1,2]};\n\n  var json = env.amsSerializer.normalize(SuperVillain, superVillain_hash, \"superVillain\");\n\n  deepEqual(json, {\n    firstName:      \"Tom\",\n    lastName:       \"Dale\",\n    homePlanet: \"123\",\n    evilMinions:   [1,2]\n  });\n});\n\ntest(\"extractSingle\", function() {\n  env.container.register('adapter:superVillain', DS.ActiveModelAdapter);\n\n  var json_hash = {\n    home_planet:   {id: \"1\", name: \"Umber\", villain_ids: [1]},\n    super_villains:  [{id: \"1\", first_name: \"Tom\", last_name: \"Dale\", home_planet_id: \"1\"}]\n  };\n\n\n  var json = env.amsSerializer.extractSingle(env.store, HomePlanet, json_hash);\n\n  deepEqual(json, {\n    \"id\": \"1\",\n    \"name\": \"Umber\",\n    \"villains\": [1]\n  });\n\n  env.store.find(\"superVillain\", 1).then(async(function(minion){\n    equal(minion.get('firstName'), \"Tom\");\n  }));\n});\n\ntest(\"extractSingle with embedded objects\", function() {\n  env.container.register('adapter:superVillain', DS.ActiveModelAdapter);\n  env.container.register('serializer:homePlanet', DS.ActiveModelSerializer.extend({\n    attrs: {\n      villains: {embedded: 'always'}\n    }\n  }));\n\n  var serializer = env.container.lookup(\"serializer:homePlanet\");\n  var json_hash = {\n    home_planet: {\n      id: \"1\",\n      name: \"Umber\",\n      villains: [{\n        id: \"1\",\n        first_name: \"Tom\",\n        last_name: \"Dale\"\n      }]\n    }\n  };\n\n  var json = serializer.extractSingle(env.store, HomePlanet, json_hash);\n\n  deepEqual(json, {\n    id: \"1\",\n    name: \"Umber\",\n    villains: [\"1\"]\n  });\n  env.store.find(\"superVillain\", 1).then(async(function(minion) {\n    equal(minion.get('firstName'), \"Tom\");\n  }));\n});\n\ntest(\"extractSingle with embedded objects inside embedded objects\", function() {\n  env.container.register('adapter:superVillain', DS.ActiveModelAdapter);\n  env.container.register('serializer:homePlanet', DS.ActiveModelSerializer.extend({\n    attrs: {\n      villains: {embedded: 'always'}\n    }\n  }));\n  env.container.register('serializer:superVillain', DS.ActiveModelSerializer.extend({\n    attrs: {\n      evilMinions: {embedded: 'always'}\n    }\n  }));\n\n  var serializer = env.container.lookup(\"serializer:homePlanet\");\n  var json_hash = {\n    home_planet: {\n      id: \"1\",\n      name: \"Umber\",\n      villains: [{\n        id: \"1\",\n        first_name: \"Tom\",\n        last_name: \"Dale\",\n        evil_minions: [{\n          id: \"1\",\n          name: \"Alex\"\n        }]\n      }]\n    }\n  };\n\n  var json = serializer.extractSingle(env.store, HomePlanet, json_hash);\n\n  deepEqual(json, {\n    id: \"1\",\n    name: \"Umber\",\n    villains: [\"1\"]\n  });\n  env.store.find(\"superVillain\", 1).then(async(function(villain) {\n    equal(villain.get('firstName'), \"Tom\");\n    equal(villain.get('evilMinions.length'), 1, \"Should load the embedded child\");\n    equal(villain.get('evilMinions.firstObject.name'), \"Alex\", \"Should load the embedded child\");\n  }));\n  env.store.find(\"evilMinion\", 1).then(async(function(minion) {\n    equal(minion.get('name'), \"Alex\");\n  }));\n});\n\ntest(\"extractSingle with embedded objects of same type\", function() {\n  env.container.register('adapter:comment', DS.ActiveModelAdapter);\n  env.container.register('serializer:comment', DS.ActiveModelSerializer.extend({\n    attrs: {\n      children: {embedded: 'always'}\n    }\n  }));\n\n  var serializer = env.container.lookup(\"serializer:comment\");\n  var json_hash = {\n    comment: {\n      id: \"1\",\n      body: \"Hello\",\n      root: true,\n      children: [{\n        id: \"2\",\n        body: \"World\",\n        root: false\n      },\n      {\n        id: \"3\",\n        body: \"Foo\",\n        root: false\n      }]\n    }\n  };\n  var json = serializer.extractSingle(env.store, Comment, json_hash);\n\n  deepEqual(json, {\n    id: \"1\",\n    body: \"Hello\",\n    root: true,\n    children: [\"2\", \"3\"]\n  }, \"Primary record was correct\");\n  equal(env.store.recordForId(\"comment\", \"2\").get(\"body\"), \"World\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"comment\", \"3\").get(\"body\"), \"Foo\", \"Secondary records found in the store\");\n});\n\ntest(\"extractSingle with embedded objects inside embedded objects of same type\", function() {\n  env.container.register('adapter:comment', DS.ActiveModelAdapter);\n  env.container.register('serializer:comment', DS.ActiveModelSerializer.extend({\n    attrs: {\n      children: {embedded: 'always'}\n    }\n  }));\n\n  var serializer = env.container.lookup(\"serializer:comment\");\n  var json_hash = {\n    comment: {\n      id: \"1\",\n      body: \"Hello\",\n      root: true,\n      children: [{\n        id: \"2\",\n        body: \"World\",\n        root: false,\n        children: [{\n          id: \"4\",\n          body: \"Another\",\n          root: false\n        }]\n      },\n      {\n        id: \"3\",\n        body: \"Foo\",\n        root: false\n      }]\n    }\n  };\n  var json = serializer.extractSingle(env.store, Comment, json_hash);\n\n  deepEqual(json, {\n    id: \"1\",\n    body: \"Hello\",\n    root: true,\n    children: [\"2\", \"3\"]\n  }, \"Primary record was correct\");\n  equal(env.store.recordForId(\"comment\", \"2\").get(\"body\"), \"World\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"comment\", \"3\").get(\"body\"), \"Foo\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"comment\", \"4\").get(\"body\"), \"Another\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"comment\", \"2\").get(\"children.length\"), 1, \"Should have one embedded record\");\n  equal(env.store.recordForId(\"comment\", \"2\").get(\"children.firstObject.body\"), \"Another\", \"Should have one embedded record\");\n});\n\ntest(\"extractSingle with embedded objects of same type, but from separate attributes\", function() {\n  env.container.register('adapter:course', DS.ActiveModelAdapter);\n  env.container.register('serializer:course', DS.ActiveModelSerializer.extend({\n    attrs: {\n      prerequisiteUnits: {embedded: 'always'},\n      units: {embedded: 'always'}\n    }\n  }));\n\n  var serializer = env.container.lookup(\"serializer:course\");\n  var json_hash = {\n    course: {\n      id: \"1\",\n      name: \"Course 1\",\n      prerequisite_units: [{\n        id: \"1\",\n        name: \"Unit 1\"\n      },{\n        id: \"3\",\n        name: \"Unit 3\"\n      }],\n      units: [{\n        id: \"2\",\n        name: \"Unit 2\"\n      },{\n        id: \"4\",\n        name: \"Unit 4\"\n      }]\n    }\n  };\n  var json = serializer.extractSingle(env.store, Course, json_hash);\n\n  deepEqual(json, {\n    id: \"1\",\n    name: \"Course 1\",\n    prerequisiteUnits: [\"1\", \"3\"],\n    units: [\"2\", \"4\"]\n  }, \"Primary array was correct\");\n\n  equal(env.store.recordForId(\"unit\", \"1\").get(\"name\"), \"Unit 1\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"unit\", \"2\").get(\"name\"), \"Unit 2\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"unit\", \"3\").get(\"name\"), \"Unit 3\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"unit\", \"4\").get(\"name\"), \"Unit 4\", \"Secondary records found in the store\");\n});\n\ntest(\"extractArray\", function() {\n  env.container.register('adapter:superVillain', DS.ActiveModelAdapter);\n\n  var json_hash = {\n    home_planets: [{id: \"1\", name: \"Umber\", villain_ids: [1]}],\n    super_villains: [{id: \"1\", first_name: \"Tom\", last_name: \"Dale\", home_planet_id: \"1\"}]\n  };\n\n  var array = env.amsSerializer.extractArray(env.store, HomePlanet, json_hash);\n\n  deepEqual(array, [{\n    \"id\": \"1\",\n    \"name\": \"Umber\",\n    \"villains\": [1]\n  }]);\n\n  env.store.find(\"superVillain\", 1).then(async(function(minion){\n    equal(minion.get('firstName'), \"Tom\");\n  }));\n});\n\ntest(\"extractArray with embedded objects\", function() {\n  env.container.register('adapter:superVillain', DS.ActiveModelAdapter);\n  env.container.register('serializer:homePlanet', DS.ActiveModelSerializer.extend({\n    attrs: {\n      villains: {embedded: 'always'}\n    }\n  }));\n\n  var serializer = env.container.lookup(\"serializer:homePlanet\");\n\n  var json_hash = {\n    home_planets: [{\n      id: \"1\",\n      name: \"Umber\",\n      villains: [{\n        id: \"1\",\n        first_name: \"Tom\",\n        last_name: \"Dale\"\n      }]\n    }]\n  };\n\n  var array = serializer.extractArray(env.store, HomePlanet, json_hash);\n\n  deepEqual(array, [{\n    id: \"1\",\n    name: \"Umber\",\n    villains: [\"1\"]\n  }]);\n\n  env.store.find(\"superVillain\", 1).then(async(function(minion){\n    equal(minion.get('firstName'), \"Tom\");\n  }));\n});\n\ntest(\"extractArray with embedded objects of same type as primary type\", function() {\n  env.container.register('adapter:comment', DS.ActiveModelAdapter);\n  env.container.register('serializer:comment', DS.ActiveModelSerializer.extend({\n    attrs: {\n      children: {embedded: 'always'}\n    }\n  }));\n\n  var serializer = env.container.lookup(\"serializer:comment\");\n\n  var json_hash = {\n    comments: [{\n      id: \"1\",\n      body: \"Hello\",\n      root: true,\n      children: [{\n        id: \"2\",\n        body: \"World\",\n        root: false\n      },\n      {\n        id: \"3\",\n        body: \"Foo\",\n        root: false\n      }]\n    }]\n  };\n\n  var array = serializer.extractArray(env.store, Comment, json_hash);\n\n  deepEqual(array, [{\n    id: \"1\",\n    body: \"Hello\",\n    root: true,\n    children: [\"2\", \"3\"]\n  }], \"Primary array is correct\");\n\n  equal(env.store.recordForId(\"comment\", \"2\").get(\"body\"), \"World\", \"Secondary record found in the store\");\n  equal(env.store.recordForId(\"comment\", \"3\").get(\"body\"), \"Foo\", \"Secondary record found in the store\");\n});\n\ntest(\"extractArray with embedded objects of same type, but from separate attributes\", function() {\n  env.container.register('adapter:course', DS.ActiveModelAdapter);\n  env.container.register('serializer:course', DS.ActiveModelSerializer.extend({\n    attrs: {\n      prerequisiteUnits: {embedded: 'always'},\n      units: {embedded: 'always'}\n    }\n  }));\n\n  var serializer = env.container.lookup(\"serializer:course\");\n  var json_hash = {\n    courses: [{\n      id: \"1\",\n      name: \"Course 1\",\n      prerequisite_units: [{\n        id: \"1\",\n        name: \"Unit 1\"\n      },{\n        id: \"3\",\n        name: \"Unit 3\"\n      }],\n      units: [{\n        id: \"2\",\n        name: \"Unit 2\"\n      },{\n        id: \"4\",\n        name: \"Unit 4\"\n      }]\n    },{\n      id: \"2\",\n      name: \"Course 2\",\n      prerequisite_units: [{\n        id: \"1\",\n        name: \"Unit 1\"\n      },{\n        id: \"3\",\n        name: \"Unit 3\"\n      }],\n      units: [{\n        id: \"5\",\n        name: \"Unit 5\"\n      },{\n        id: \"6\",\n        name: \"Unit 6\"\n      }]\n    }]\n  };\n  var json = serializer.extractArray(env.store, Course, json_hash);\n\n  deepEqual(json, [{\n    id: \"1\",\n    name: \"Course 1\",\n    prerequisiteUnits: [\"1\", \"3\"],\n    units: [\"2\", \"4\"]\n  },{\n    id: \"2\",\n    name: \"Course 2\",\n    prerequisiteUnits: [\"1\", \"3\"],\n    units: [\"5\", \"6\"]\n  }], \"Primary array was correct\");\n\n  equal(env.store.recordForId(\"unit\", \"1\").get(\"name\"), \"Unit 1\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"unit\", \"2\").get(\"name\"), \"Unit 2\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"unit\", \"3\").get(\"name\"), \"Unit 3\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"unit\", \"4\").get(\"name\"), \"Unit 4\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"unit\", \"5\").get(\"name\"), \"Unit 5\", \"Secondary records found in the store\");\n  equal(env.store.recordForId(\"unit\", \"6\").get(\"name\"), \"Unit 6\", \"Secondary records found in the store\");\n});\n\ntest(\"serialize polymorphic\", function() {\n  var tom = env.store.createRecord(YellowMinion,   {name: \"Alex\", id: \"124\"});\n  var ray = env.store.createRecord(DoomsdayDevice, {evilMinion: tom, name: \"DeathRay\"});\n\n  var json = env.amsSerializer.serialize(ray);\n\n  deepEqual(json, {\n    name:  \"DeathRay\",\n    evil_minion_type: \"YellowMinion\",\n    evil_minion_id: \"124\"\n  });\n});\n\ntest(\"serialize with embedded objects\", function() {\n  league = env.store.createRecord(HomePlanet, { name: \"Villain League\", id: \"123\" });\n  var tom = env.store.createRecord(SuperVillain, { firstName: \"Tom\", lastName: \"Dale\", homePlanet: league });\n\n  env.container.register('serializer:homePlanet', DS.ActiveModelSerializer.extend({\n    attrs: {\n      villains: {embedded: 'always'}\n    }\n  }));\n  var serializer = env.container.lookup(\"serializer:homePlanet\");\n\n  var json = serializer.serialize(league);\n\n  deepEqual(json, {\n    name: \"Villain League\",\n    villains: [{\n      id: get(tom, \"id\"),\n      first_name: \"Tom\",\n      last_name: \"Dale\",\n      home_planet_id: get(league, \"id\")\n    }]\n  });\n});\n\ntest(\"extractPolymorphic hasMany\", function() {\n  env.container.register('adapter:yellowMinion', DS.ActiveModelAdapter);\n  PopularVillain.toString   = function() { return \"PopularVillain\"; };\n  YellowMinion.toString = function() { return \"YellowMinion\"; };\n\n  var json_hash = {\n    popular_villain: {id: 1, name: \"Dr Horrible\", evil_minions: [{ type: \"yellow_minion\", id: 12}] },\n    evil_minions:    [{id: 12, name: \"Alex\", doomsday_device_ids: [1] }]\n  };\n\n  var json = env.amsSerializer.extractSingle(env.store, PopularVillain, json_hash);\n\n  deepEqual(json, {\n    \"id\": 1,\n    \"name\": \"Dr Horrible\",\n    \"evilMinions\": [{\n      type: \"yellowMinion\",\n      id: 12\n    }]\n  });\n});\n\ntest(\"extractPolymorphic\", function() {\n  env.container.register('adapter:yellowMinion', DS.ActiveModelAdapter);\n  EvilMinion.toString   = function() { return \"EvilMinion\"; };\n  YellowMinion.toString = function() { return \"YellowMinion\"; };\n\n  var json_hash = {\n    doomsday_device: {id: 1, name: \"DeathRay\", evil_minion: { type: \"yellow_minion\", id: 12}},\n    evil_minions:    [{id: 12, name: \"Alex\", doomsday_device_ids: [1] }]\n  };\n\n  var json = env.amsSerializer.extractSingle(env.store, DoomsdayDevice, json_hash);\n\n  deepEqual(json, {\n    \"id\": 1,\n    \"name\": \"DeathRay\",\n    \"evilMinion\": {\n      type: \"yellowMinion\",\n      id: 12\n    }\n  });\n});\n\ntest(\"extractPolymorphic when the related data is not specified\", function() {\n  var json = {\n    doomsday_device: {id: 1, name: \"DeathRay\"},\n    evil_minions:    [{id: 12, name: \"Alex\", doomsday_device_ids: [1] }]\n  };\n\n  json = env.amsSerializer.extractSingle(env.store, DoomsdayDevice, json);\n\n  deepEqual(json, {\n    \"id\": 1,\n    \"name\": \"DeathRay\",\n    \"evilMinion\": undefined\n  });\n});\n\ntest(\"extractPolymorphic hasMany when the related data is not specified\", function() {\n  var json = {\n    popular_villain: {id: 1, name: \"Dr Horrible\"}\n  };\n\n  json = env.amsSerializer.extractSingle(env.store, PopularVillain, json);\n\n  deepEqual(json, {\n    \"id\": 1,\n    \"name\": \"Dr Horrible\",\n    \"evilMinions\": undefined\n  });\n});\n\ntest(\"extractPolymorphic does not break hasMany relationships\", function() {\n  var json = {\n    popular_villain: {id: 1, name: \"Dr. Evil\", evil_minions: []}\n  };\n\n  json = env.amsSerializer.extractSingle(env.store, PopularVillain, json);\n\n  deepEqual(json, {\n    \"id\": 1,\n    \"name\": \"Dr. Evil\",\n    \"evilMinions\": []\n  });\n});\n\n})();\n//@ sourceURL=activemodel-adapter/~tests/integration/active_model_serializer_test");