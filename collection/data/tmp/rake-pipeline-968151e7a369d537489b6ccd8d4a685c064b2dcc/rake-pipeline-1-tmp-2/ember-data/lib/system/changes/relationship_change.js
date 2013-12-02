minispade.register('ember-data/system/changes/relationship_change', "(function() {/**\n  @module ember-data\n*/\n\nvar get = Ember.get, set = Ember.set;\nvar forEach = Ember.EnumerableUtils.forEach;\n\n/**\n  @class RelationshipChange\n  @namespace DS\n  @private\n  @construtor\n*/\nDS.RelationshipChange = function(options) {\n  this.parentRecord = options.parentRecord;\n  this.childRecord = options.childRecord;\n  this.firstRecord = options.firstRecord;\n  this.firstRecordKind = options.firstRecordKind;\n  this.firstRecordName = options.firstRecordName;\n  this.secondRecord = options.secondRecord;\n  this.secondRecordKind = options.secondRecordKind;\n  this.secondRecordName = options.secondRecordName;\n  this.changeType = options.changeType;\n  this.store = options.store;\n\n  this.committed = {};\n};\n\n/**\n  @class RelationshipChangeAdd\n  @namespace DS\n  @private\n  @construtor\n*/\nDS.RelationshipChangeAdd = function(options){\n  DS.RelationshipChange.call(this, options);\n};\n\n/**\n  @class RelationshipChangeRemove\n  @namespace DS\n  @private\n  @construtor\n*/\nDS.RelationshipChangeRemove = function(options){\n  DS.RelationshipChange.call(this, options);\n};\n\nDS.RelationshipChange.create = function(options) {\n  return new DS.RelationshipChange(options);\n};\n\nDS.RelationshipChangeAdd.create = function(options) {\n  return new DS.RelationshipChangeAdd(options);\n};\n\nDS.RelationshipChangeRemove.create = function(options) {\n  return new DS.RelationshipChangeRemove(options);\n};\n\nDS.OneToManyChange = {};\nDS.OneToNoneChange = {};\nDS.ManyToNoneChange = {};\nDS.OneToOneChange = {};\nDS.ManyToManyChange = {};\n\nDS.RelationshipChange._createChange = function(options){\n  if(options.changeType === \"add\"){\n    return DS.RelationshipChangeAdd.create(options);\n  }\n  if(options.changeType === \"remove\"){\n    return DS.RelationshipChangeRemove.create(options);\n  }\n};\n\n\nDS.RelationshipChange.determineRelationshipType = function(recordType, knownSide){\n  var knownKey = knownSide.key, key, otherKind;\n  var knownKind = knownSide.kind;\n\n  var inverse = recordType.inverseFor(knownKey);\n\n  if (inverse){\n    key = inverse.name;\n    otherKind = inverse.kind;\n  }\n\n  if (!inverse){\n    return knownKind === \"belongsTo\" ? \"oneToNone\" : \"manyToNone\";\n  }\n  else{\n    if(otherKind === \"belongsTo\"){\n      return knownKind === \"belongsTo\" ? \"oneToOne\" : \"manyToOne\";\n    }\n    else{\n      return knownKind === \"belongsTo\" ? \"oneToMany\" : \"manyToMany\";\n    }\n  }\n\n};\n\nDS.RelationshipChange.createChange = function(firstRecord, secondRecord, store, options){\n  // Get the type of the child based on the child's client ID\n  var firstRecordType = firstRecord.constructor, changeType;\n  changeType = DS.RelationshipChange.determineRelationshipType(firstRecordType, options);\n  if (changeType === \"oneToMany\"){\n    return DS.OneToManyChange.createChange(firstRecord, secondRecord, store, options);\n  }\n  else if (changeType === \"manyToOne\"){\n    return DS.OneToManyChange.createChange(secondRecord, firstRecord, store, options);\n  }\n  else if (changeType === \"oneToNone\"){\n    return DS.OneToNoneChange.createChange(firstRecord, secondRecord, store, options);\n  }\n  else if (changeType === \"manyToNone\"){\n    return DS.ManyToNoneChange.createChange(firstRecord, secondRecord, store, options);\n  }\n  else if (changeType === \"oneToOne\"){\n    return DS.OneToOneChange.createChange(firstRecord, secondRecord, store, options);\n  }\n  else if (changeType === \"manyToMany\"){\n    return DS.ManyToManyChange.createChange(firstRecord, secondRecord, store, options);\n  }\n};\n\nDS.OneToNoneChange.createChange = function(childRecord, parentRecord, store, options) {\n  var key = options.key;\n  var change = DS.RelationshipChange._createChange({\n      parentRecord: parentRecord,\n      childRecord: childRecord,\n      firstRecord: childRecord,\n      store: store,\n      changeType: options.changeType,\n      firstRecordName: key,\n      firstRecordKind: \"belongsTo\"\n  });\n\n  store.addRelationshipChangeFor(childRecord, key, parentRecord, null, change);\n\n  return change;\n};\n\nDS.ManyToNoneChange.createChange = function(childRecord, parentRecord, store, options) {\n  var key = options.key;\n  var change = DS.RelationshipChange._createChange({\n      parentRecord: childRecord,\n      childRecord: parentRecord,\n      secondRecord: childRecord,\n      store: store,\n      changeType: options.changeType,\n      secondRecordName: options.key,\n      secondRecordKind: \"hasMany\"\n  });\n\n  store.addRelationshipChangeFor(childRecord, key, parentRecord, null, change);\n  return change;\n};\n\n\nDS.ManyToManyChange.createChange = function(childRecord, parentRecord, store, options) {\n  // If the name of the belongsTo side of the relationship is specified,\n  // use that\n  // If the type of the parent is specified, look it up on the child's type\n  // definition.\n  var key = options.key;\n\n  var change = DS.RelationshipChange._createChange({\n      parentRecord: parentRecord,\n      childRecord: childRecord,\n      firstRecord: childRecord,\n      secondRecord: parentRecord,\n      firstRecordKind: \"hasMany\",\n      secondRecordKind: \"hasMany\",\n      store: store,\n      changeType: options.changeType,\n      firstRecordName:  key\n  });\n\n  store.addRelationshipChangeFor(childRecord, key, parentRecord, null, change);\n\n\n  return change;\n};\n\nDS.OneToOneChange.createChange = function(childRecord, parentRecord, store, options) {\n  var key;\n\n  // If the name of the belongsTo side of the relationship is specified,\n  // use that\n  // If the type of the parent is specified, look it up on the child's type\n  // definition.\n  if (options.parentType) {\n    key = options.parentType.inverseFor(options.key).name;\n  } else if (options.key) {\n    key = options.key;\n  } else {\n    Ember.assert(\"You must pass either a parentType or belongsToName option to OneToManyChange.forChildAndParent\", false);\n  }\n\n  var change = DS.RelationshipChange._createChange({\n      parentRecord: parentRecord,\n      childRecord: childRecord,\n      firstRecord: childRecord,\n      secondRecord: parentRecord,\n      firstRecordKind: \"belongsTo\",\n      secondRecordKind: \"belongsTo\",\n      store: store,\n      changeType: options.changeType,\n      firstRecordName:  key\n  });\n\n  store.addRelationshipChangeFor(childRecord, key, parentRecord, null, change);\n\n\n  return change;\n};\n\nDS.OneToOneChange.maintainInvariant = function(options, store, childRecord, key){\n  if (options.changeType === \"add\" && store.recordIsMaterialized(childRecord)) {\n    var oldParent = get(childRecord, key);\n    if (oldParent){\n      var correspondingChange = DS.OneToOneChange.createChange(childRecord, oldParent, store, {\n          parentType: options.parentType,\n          hasManyName: options.hasManyName,\n          changeType: \"remove\",\n          key: options.key\n        });\n      store.addRelationshipChangeFor(childRecord, key, options.parentRecord , null, correspondingChange);\n     correspondingChange.sync();\n    }\n  }\n};\n\nDS.OneToManyChange.createChange = function(childRecord, parentRecord, store, options) {\n  var key;\n\n  // If the name of the belongsTo side of the relationship is specified,\n  // use that\n  // If the type of the parent is specified, look it up on the child's type\n  // definition.\n  if (options.parentType) {\n    key = options.parentType.inverseFor(options.key).name;\n    DS.OneToManyChange.maintainInvariant( options, store, childRecord, key );\n  } else if (options.key) {\n    key = options.key;\n  } else {\n    Ember.assert(\"You must pass either a parentType or belongsToName option to OneToManyChange.forChildAndParent\", false);\n  }\n\n  var change = DS.RelationshipChange._createChange({\n      parentRecord: parentRecord,\n      childRecord: childRecord,\n      firstRecord: childRecord,\n      secondRecord: parentRecord,\n      firstRecordKind: \"belongsTo\",\n      secondRecordKind: \"hasMany\",\n      store: store,\n      changeType: options.changeType,\n      firstRecordName:  key\n  });\n\n  store.addRelationshipChangeFor(childRecord, key, parentRecord, change.getSecondRecordName(), change);\n\n\n  return change;\n};\n\n\nDS.OneToManyChange.maintainInvariant = function(options, store, childRecord, key){\n  if (options.changeType === \"add\" && childRecord) {\n    var oldParent = get(childRecord, key);\n    if (oldParent){\n      var correspondingChange = DS.OneToManyChange.createChange(childRecord, oldParent, store, {\n          parentType: options.parentType,\n          hasManyName: options.hasManyName,\n          changeType: \"remove\",\n          key: options.key\n        });\n      store.addRelationshipChangeFor(childRecord, key, options.parentRecord, correspondingChange.getSecondRecordName(), correspondingChange);\n      correspondingChange.sync();\n    }\n  }\n};\n\n/**\n  @class RelationshipChange\n  @namespace DS\n*/\nDS.RelationshipChange.prototype = {\n\n  getSecondRecordName: function() {\n    var name = this.secondRecordName, parent;\n\n    if (!name) {\n      parent = this.secondRecord;\n      if (!parent) { return; }\n\n      var childType = this.firstRecord.constructor;\n      var inverse = childType.inverseFor(this.firstRecordName);\n      this.secondRecordName = inverse.name;\n    }\n\n    return this.secondRecordName;\n  },\n\n  /**\n    Get the name of the relationship on the belongsTo side.\n\n    @method getFirstRecordName\n    @return {String}\n  */\n  getFirstRecordName: function() {\n    var name = this.firstRecordName;\n    return name;\n  },\n\n  /**\n    @method destroy\n    @private\n  */\n  destroy: function() {\n    var childRecord = this.childRecord,\n        belongsToName = this.getFirstRecordName(),\n        hasManyName = this.getSecondRecordName(),\n        store = this.store;\n\n    store.removeRelationshipChangeFor(childRecord, belongsToName, this.parentRecord, hasManyName, this.changeType);\n  },\n\n  getSecondRecord: function(){\n    return this.secondRecord;\n  },\n\n  /**\n    @method getFirstRecord\n    @private\n  */\n  getFirstRecord: function() {\n    return this.firstRecord;\n  },\n\n  coalesce: function(){\n    var relationshipPairs = this.store.relationshipChangePairsFor(this.firstRecord);\n    forEach(relationshipPairs, function(pair){\n      var addedChange = pair[\"add\"];\n      var removedChange = pair[\"remove\"];\n      if(addedChange && removedChange) {\n        addedChange.destroy();\n        removedChange.destroy();\n      }\n    });\n  }\n};\n\nDS.RelationshipChangeAdd.prototype = Ember.create(DS.RelationshipChange.create({}));\nDS.RelationshipChangeRemove.prototype = Ember.create(DS.RelationshipChange.create({}));\n\n// the object is a value, and not a promise\nfunction isValue(object) {\n  return typeof object === 'object' && (!object.then || typeof object.then !== 'function');\n}\n\nDS.RelationshipChangeAdd.prototype.changeType = \"add\";\nDS.RelationshipChangeAdd.prototype.sync = function() {\n  var secondRecordName = this.getSecondRecordName(),\n      firstRecordName = this.getFirstRecordName(),\n      firstRecord = this.getFirstRecord(),\n      secondRecord = this.getSecondRecord();\n\n  //Ember.assert(\"You specified a hasMany (\" + hasManyName + \") on \" + (!belongsToName && (newParent || oldParent || this.lastParent).constructor) + \" but did not specify an inverse belongsTo on \" + child.constructor, belongsToName);\n  //Ember.assert(\"You specified a belongsTo (\" + belongsToName + \") on \" + child.constructor + \" but did not specify an inverse hasMany on \" + (!hasManyName && (newParent || oldParent || this.lastParentRecord).constructor), hasManyName);\n\n  if (secondRecord instanceof DS.Model && firstRecord instanceof DS.Model) {\n    if(this.secondRecordKind === \"belongsTo\"){\n      secondRecord.suspendRelationshipObservers(function(){\n        set(secondRecord, secondRecordName, firstRecord);\n      });\n\n     }\n     else if(this.secondRecordKind === \"hasMany\"){\n      secondRecord.suspendRelationshipObservers(function(){\n        var relationship = get(secondRecord, secondRecordName);\n        if (isValue(relationship)) { relationship.addObject(firstRecord); }\n      });\n    }\n  }\n\n  if (firstRecord instanceof DS.Model && secondRecord instanceof DS.Model && get(firstRecord, firstRecordName) !== secondRecord) {\n    if(this.firstRecordKind === \"belongsTo\"){\n      firstRecord.suspendRelationshipObservers(function(){\n        set(firstRecord, firstRecordName, secondRecord);\n      });\n    }\n    else if(this.firstRecordKind === \"hasMany\"){\n      firstRecord.suspendRelationshipObservers(function(){\n        var relationship = get(firstRecord, firstRecordName);\n        if (isValue(relationship)) { relationship.addObject(secondRecord); }\n      });\n    }\n  }\n\n  this.coalesce();\n};\n\nDS.RelationshipChangeRemove.prototype.changeType = \"remove\";\nDS.RelationshipChangeRemove.prototype.sync = function() {\n  var secondRecordName = this.getSecondRecordName(),\n      firstRecordName = this.getFirstRecordName(),\n      firstRecord = this.getFirstRecord(),\n      secondRecord = this.getSecondRecord();\n\n  //Ember.assert(\"You specified a hasMany (\" + hasManyName + \") on \" + (!belongsToName && (newParent || oldParent || this.lastParent).constructor) + \" but did not specify an inverse belongsTo on \" + child.constructor, belongsToName);\n  //Ember.assert(\"You specified a belongsTo (\" + belongsToName + \") on \" + child.constructor + \" but did not specify an inverse hasMany on \" + (!hasManyName && (newParent || oldParent || this.lastParentRecord).constructor), hasManyName);\n\n  if (secondRecord instanceof DS.Model && firstRecord instanceof DS.Model) {\n    if(this.secondRecordKind === \"belongsTo\"){\n      secondRecord.suspendRelationshipObservers(function(){\n        set(secondRecord, secondRecordName, null);\n      });\n    }\n    else if(this.secondRecordKind === \"hasMany\"){\n      secondRecord.suspendRelationshipObservers(function(){\n        var relationship = get(secondRecord, secondRecordName);\n        if (isValue(relationship)) { relationship.removeObject(firstRecord); }\n      });\n    }\n  }\n\n  if (firstRecord instanceof DS.Model && get(firstRecord, firstRecordName)) {\n    if(this.firstRecordKind === \"belongsTo\"){\n      firstRecord.suspendRelationshipObservers(function(){\n        set(firstRecord, firstRecordName, null);\n      });\n     }\n     else if(this.firstRecordKind === \"hasMany\"){\n       firstRecord.suspendRelationshipObservers(function(){\n         var relationship = get(firstRecord, firstRecordName);\n         if (isValue(relationship)) { relationship.removeObject(secondRecord); }\n      });\n    }\n  }\n\n  this.coalesce();\n};\n\n})();\n//@ sourceURL=ember-data/system/changes/relationship_change");