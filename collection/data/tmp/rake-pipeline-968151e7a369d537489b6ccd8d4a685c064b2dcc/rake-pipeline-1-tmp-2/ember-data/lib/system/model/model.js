minispade.register('ember-data/system/model/model', "(function() {minispade.require(\"ember-data/system/model/states\");\n\n/**\n  @module ember-data\n*/\n\nvar get = Ember.get, set = Ember.set,\n    merge = Ember.merge, once = Ember.run.once;\n\nvar retrieveFromCurrentState = Ember.computed(function(key, value) {\n  return get(get(this, 'currentState'), key);\n}).property('currentState').readOnly();\n\n/**\n\n  The model class that all Ember Data records descend from.\n\n  @class Model\n  @namespace DS\n  @extends Ember.Object\n  @uses Ember.Evented\n*/\nDS.Model = Ember.Object.extend(Ember.Evented, {\n  isEmpty: retrieveFromCurrentState,\n  isLoading: retrieveFromCurrentState,\n  isLoaded: retrieveFromCurrentState,\n  isDirty: retrieveFromCurrentState,\n  isSaving: retrieveFromCurrentState,\n  isDeleted: retrieveFromCurrentState,\n  isNew: retrieveFromCurrentState,\n  isValid: retrieveFromCurrentState,\n  dirtyType: retrieveFromCurrentState,\n\n  isError: false,\n  isReloading: false,\n\n  clientId: null,\n  id: null,\n  transaction: null,\n  currentState: null,\n  errors: null,\n\n  /**\n    Create a JSON representation of the record, using the serialization\n    strategy of the store's adapter.\n\n    @method serialize\n    @param {Object} options Available options:\n\n    * `includeId`: `true` if the record's ID should be included in the\n      JSON representation.\n\n    @returns {Object} an object whose values are primitive JSON values only\n  */\n  serialize: function(options) {\n    var store = get(this, 'store');\n    return store.serialize(this, options);\n  },\n\n  /**\n    Use {{#crossLink \"DS.JSONSerializer\"}}DS.JSONSerializer{{/crossLink}} to\n    get the JSON representation of a record.\n\n    @method toJSON\n    @param {Object} options Available options:\n\n    * `includeId`: `true` if the record's ID should be included in the\n      JSON representation.\n\n    @returns {Object} A JSON representation of the object.\n  */\n  toJSON: function(options) {\n    // container is for lazy transform lookups\n    var serializer = DS.JSONSerializer.create({ container: this.container });\n    return serializer.serialize(this, options);\n  },\n\n  /**\n    Fired when the record is loaded from the server.\n\n    @event didLoad\n  */\n  didLoad: Ember.K,\n\n  /**\n    Fired when the record is reloaded from the server.\n\n    @event didReload\n  */\n  didReload: Ember.K,\n\n  /**\n    Fired when the record is updated.\n\n    @event didUpdate\n  */\n  didUpdate: Ember.K,\n\n  /**\n    Fired when the record is created.\n\n    @event didCreate\n  */\n  didCreate: Ember.K,\n\n  /**\n    Fired when the record is deleted.\n\n    @event didDelete\n  */\n  didDelete: Ember.K,\n\n  /**\n    Fired when the record becomes invalid.\n\n    @event becameInvalid\n  */\n  becameInvalid: Ember.K,\n\n  /**\n    Fired when the record enters the error state.\n\n    @event becameError\n  */\n  becameError: Ember.K,\n\n  data: Ember.computed(function() {\n    this._data = this._data || {};\n    return this._data;\n  }).property(),\n\n  _data: null,\n\n  init: function() {\n    set(this, 'currentState', DS.RootState.empty);\n    this._super();\n    this._setup();\n  },\n\n  _setup: function() {\n    this._changesToSync = {};\n    this._deferredTriggers = [];\n    this._data = {};\n    this._attributes = {};\n    this._inFlightAttributes = {};\n    this._relationships = {};\n  },\n\n  send: function(name, context) {\n    var currentState = get(this, 'currentState');\n\n    if (!currentState[name]) {\n      this._unhandledEvent(currentState, name, context);\n    }\n\n    return currentState[name](this, context);\n  },\n\n  transitionTo: function(name) {\n    // POSSIBLE TODO: Remove this code and replace with\n    // always having direct references to state objects\n\n    var pivotName = name.split(\".\", 1),\n        currentState = get(this, 'currentState'),\n        state = currentState;\n\n    do {\n      if (state.exit) { state.exit(this); }\n      state = state.parentState;\n    } while (!state.hasOwnProperty(pivotName));\n\n    var path = name.split(\".\");\n\n    var setups = [], enters = [], i, l;\n\n    for (i=0, l=path.length; i<l; i++) {\n      state = state[path[i]];\n\n      if (state.enter) { enters.push(state); }\n      if (state.setup) { setups.push(state); }\n    }\n\n    for (i=0, l=enters.length; i<l; i++) {\n      enters[i].enter(this);\n    }\n\n    set(this, 'currentState', state);\n\n    for (i=0, l=setups.length; i<l; i++) {\n      setups[i].setup(this);\n    }\n\n    this.updateRecordArraysLater();\n  },\n\n  _unhandledEvent: function(state, name, context) {\n    var errorMessage = \"Attempted to handle event `\" + name + \"` \";\n    errorMessage    += \"on \" + String(this) + \" while in state \";\n    errorMessage    += state.stateName + \". \";\n\n    if (context !== undefined) {\n      errorMessage  += \"Called with \" + Ember.inspect(context) + \".\";\n    }\n\n    throw new Ember.Error(errorMessage);\n  },\n\n  withTransaction: function(fn) {\n    var transaction = get(this, 'transaction');\n    if (transaction) { fn(transaction); }\n  },\n\n  loadingData: function(promise) {\n    this.send('loadingData', promise);\n  },\n\n  loadedData: function() {\n    this.send('loadedData');\n  },\n\n  notFound: function() {\n    this.send('notFound');\n  },\n\n  pushedData: function() {\n    this.send('pushedData');\n  },\n\n  /**\n    Marks the record as deleted but does not save it. You must call\n    `save` afterwards if you want to persist it. You might use this\n    method if you want to allow the user to still `rollback()` a\n    delete after it was made.\n\n    @method deleteRecord\n  */\n  deleteRecord: function() {\n    this.send('deleteRecord');\n  },\n\n  /**\n    Same as `deleteRecord`, but saves the record immediately.\n\n    @method destroyRecord\n    @returns Promise\n  */\n  destroyRecord: function() {\n    this.deleteRecord();\n    return this.save();\n  },\n\n  unloadRecord: function() {\n    Ember.assert(\"You can only unload a loaded, non-dirty record.\", !get(this, 'isDirty'));\n\n    this.send('unloadRecord');\n  },\n\n  clearRelationships: function() {\n    this.eachRelationship(function(name, relationship) {\n      if (relationship.kind === 'belongsTo') {\n        set(this, name, null);\n      } else if (relationship.kind === 'hasMany') {\n        var hasMany = this._relationships[relationship.name];\n        if (hasMany) { hasMany.clear(); }\n      }\n    }, this);\n  },\n\n  updateRecordArrays: function() {\n    var store = get(this, 'store');\n    if (store) {\n      store.dataWasUpdated(this.constructor, this);\n    }\n  },\n\n  /**\n    Gets the diff for the current model.\n\n    @method changedAttributes\n\n    @returns {Object} an object, whose keys are changed properties,\n      and value is an [oldProp, newProp] array.\n  */\n  changedAttributes: function() {\n    var oldData = get(this, '_data'),\n        newData = get(this, '_attributes'),\n        diffData = {},\n        prop;\n\n    for (prop in newData) {\n      diffData[prop] = [oldData[prop], newData[prop]];\n    }\n\n    return diffData;\n  },\n\n  adapterWillCommit: function() {\n    this.send('willCommit');\n  },\n\n  /**\n    If the adapter did not return a hash in response to a commit,\n    merge the changed attributes and relationships into the existing\n    saved data.\n\n    @method adapterDidCommit\n  */\n  adapterDidCommit: function(data) {\n    set(this, 'isError', false);\n\n    if (data) {\n      this._data = data;\n    } else {\n      Ember.mixin(this._data, this._inFlightAttributes);\n    }\n\n    this._inFlightAttributes = {};\n\n    this.send('didCommit');\n    this.updateRecordArraysLater();\n\n    if (!data) { return; }\n\n    this.suspendRelationshipObservers(function() {\n      this.notifyPropertyChange('data');\n    });\n  },\n\n  adapterDidDirty: function() {\n    this.send('becomeDirty');\n    this.updateRecordArraysLater();\n  },\n\n  dataDidChange: Ember.observer(function() {\n    this.reloadHasManys();\n  }, 'data'),\n\n  reloadHasManys: function() {\n    var relationships = get(this.constructor, 'relationshipsByName');\n    this.updateRecordArraysLater();\n    relationships.forEach(function(name, relationship) {\n      if (this._data.links && this._data.links[name]) { return; }\n      if (relationship.kind === 'hasMany') {\n        this.hasManyDidChange(relationship.key);\n      }\n    }, this);\n  },\n\n  hasManyDidChange: function(key) {\n    var hasMany = this._relationships[key];\n\n    if (hasMany) {\n      var records = this._data[key] || [];\n\n      set(hasMany, 'content', Ember.A(records));\n      set(hasMany, 'isLoaded', true);\n      hasMany.trigger('didLoad');\n    }\n  },\n\n  updateRecordArraysLater: function() {\n    Ember.run.once(this, this.updateRecordArrays);\n  },\n\n  setupData: function(data, partial) {\n    if (partial) {\n      Ember.merge(this._data, data);\n    } else {\n      this._data = data;\n    }\n\n    var relationships = this._relationships;\n\n    this.eachRelationship(function(name, rel) {\n      if (data.links && data.links[name]) { return; }\n      if (rel.options.async) { relationships[name] = null; }\n    });\n\n    if (data) { this.pushedData(); }\n\n    this.suspendRelationshipObservers(function() {\n      this.notifyPropertyChange('data');\n    });\n  },\n\n  materializeId: function(id) {\n    set(this, 'id', id);\n  },\n\n  materializeAttributes: function(attributes) {\n    Ember.assert(\"Must pass a hash of attributes to materializeAttributes\", !!attributes);\n    merge(this._data, attributes);\n  },\n\n  materializeAttribute: function(name, value) {\n    this._data[name] = value;\n  },\n\n  updateHasMany: function(name, records) {\n    this._data[name] = records;\n    this.hasManyDidChange(name);\n  },\n\n  updateBelongsTo: function(name, record) {\n    this._data[name] = record;\n  },\n\n  rollback: function() {\n    this._attributes = {};\n\n    if (get(this, 'isError')) {\n      this._inFlightAttributes = {};\n      set(this, 'isError', false);\n    }\n\n    this.send('rolledBack');\n\n    this.suspendRelationshipObservers(function() {\n      this.notifyPropertyChange('data');\n    });\n  },\n\n  toStringExtension: function() {\n    return get(this, 'id');\n  },\n\n  /**\n    The goal of this method is to temporarily disable specific observers\n    that take action in response to application changes.\n\n    This allows the system to make changes (such as materialization and\n    rollback) that should not trigger secondary behavior (such as setting an\n    inverse relationship or marking records as dirty).\n\n    The specific implementation will likely change as Ember proper provides\n    better infrastructure for suspending groups of observers, and if Array\n    observation becomes more unified with regular observers.\n\n    @method suspendRelationshipObservers\n    @private\n    @param callback\n    @param binding\n  */\n  suspendRelationshipObservers: function(callback, binding) {\n    var observers = get(this.constructor, 'relationshipNames').belongsTo;\n    var self = this;\n\n    try {\n      this._suspendedRelationships = true;\n      Ember._suspendObservers(self, observers, null, 'belongsToDidChange', function() {\n        Ember._suspendBeforeObservers(self, observers, null, 'belongsToWillChange', function() {\n          callback.call(binding || self);\n        });\n      });\n    } finally {\n      this._suspendedRelationships = false;\n    }\n  },\n\n  /**\n    Save the record.\n\n    @method save\n  */\n  save: function() {\n    var resolver = Ember.RSVP.defer();\n\n    this.get('store').scheduleSave(this, resolver);\n    this._inFlightAttributes = this._attributes;\n    this._attributes = {};\n\n    return DS.PromiseObject.create({ promise: resolver.promise });\n  },\n\n  /**\n    Reload the record from the adapter.\n\n    This will only work if the record has already finished loading\n    and has not yet been modified (`isLoaded` but not `isDirty`,\n    or `isSaving`).\n\n    @method reload\n  */\n  reload: function() {\n    set(this, 'isReloading', true);\n\n    var resolver = Ember.RSVP.defer(), record = this;\n\n    resolver.promise = resolver.promise.then(function() {\n      record.set('isReloading', false);\n      record.set('isError', false);\n      return record;\n    }, function(reason) {\n      record.set('isError', true);\n      throw reason;\n    });\n\n    this.send('reloadRecord', resolver);\n\n    return DS.PromiseObject.create({ promise: resolver.promise });\n  },\n\n  // FOR USE DURING COMMIT PROCESS\n\n  adapterDidUpdateAttribute: function(attributeName, value) {\n\n    // If a value is passed in, update the internal attributes and clear\n    // the attribute cache so it picks up the new value. Otherwise,\n    // collapse the current value into the internal attributes because\n    // the adapter has acknowledged it.\n    if (value !== undefined) {\n      this._data[attributeName] = value;\n      this.notifyPropertyChange(attributeName);\n    } else {\n      this._data[attributeName] = this._inFlightAttributes[attributeName];\n    }\n\n    this.updateRecordArraysLater();\n  },\n\n  adapterDidInvalidate: function(errors) {\n    this.send('becameInvalid', errors);\n  },\n\n  adapterDidError: function() {\n    this.send('becameError');\n    set(this, 'isError', true);\n  },\n\n  /**\n    Override the default event firing from Ember.Evented to\n    also call methods with the given name.\n\n    @method trigger\n    @private\n    @param name\n  */\n  trigger: function(name) {\n    Ember.tryInvoke(this, name, [].slice.call(arguments, 1));\n    this._super.apply(this, arguments);\n  },\n\n  triggerLater: function() {\n    this._deferredTriggers.push(arguments);\n    once(this, '_triggerDeferredTriggers');\n  },\n\n  _triggerDeferredTriggers: function() {\n    for (var i=0, l=this._deferredTriggers.length; i<l; i++) {\n      this.trigger.apply(this, this._deferredTriggers[i]);\n    }\n\n    this._deferredTriggers = [];\n  }\n});\n\nDS.Model.reopenClass({\n\n  /**\n    Alias DS.Model's `create` method to `_create`. This allows us to create DS.Model\n    instances from within the store, but if end users accidentally call `create()`\n    (instead of `createRecord()`), we can raise an error.\n\n    @method _create\n    @private\n    @static\n  */\n  _create: DS.Model.create,\n\n  /**\n    Override the class' `create()` method to raise an error. This prevents end users\n    from inadvertently calling `create()` instead of `createRecord()`. The store is\n    still able to create instances by calling the `_create()` method.\n\n    @method create\n    @private\n    @static\n  */\n  create: function() {\n    throw new Ember.Error(\"You should not call `create` on a model. Instead, call `store.createRecord` with the attributes you would like to set.\");\n  }\n});\n\n})();\n//@ sourceURL=ember-data/system/model/model");