minispade.register('ember-data/system/adapter', "(function() {/**\n  @module ember-data\n*/\n\nvar get = Ember.get, set = Ember.set;\nvar map = Ember.ArrayPolyfills.map;\n\nvar errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];\n\nDS.InvalidError = function(errors) {\n  var tmp = Error.prototype.constructor.call(this, \"The backend rejected the commit because it was invalid: \" + Ember.inspect(errors));\n  this.errors = errors;\n\n  for (var i=0, l=errorProps.length; i<l; i++) {\n    this[errorProps[i]] = tmp[errorProps[i]];\n  }\n};\nDS.InvalidError.prototype = Ember.create(Error.prototype);\n\n/**\n  An adapter is an object that receives requests from a store and\n  translates them into the appropriate action to take against your\n  persistence layer. The persistence layer is usually an HTTP API, but may\n  be anything, such as the browser's local storage.\n\n  ### Creating an Adapter\n\n  First, create a new subclass of `DS.Adapter`:\n\n      App.MyAdapter = DS.Adapter.extend({\n        // ...your code here\n      });\n\n  To tell your store which adapter to use, set its `adapter` property:\n\n      App.store = DS.Store.create({\n        adapter: App.MyAdapter.create()\n      });\n\n  `DS.Adapter` is an abstract base class that you should override in your\n  application to customize it for your backend. The minimum set of methods\n  that you should implement is:\n\n    * `find()`\n    * `createRecord()`\n    * `updateRecord()`\n    * `deleteRecord()`\n\n  To improve the network performance of your application, you can optimize\n  your adapter by overriding these lower-level methods:\n\n    * `findMany()`\n    * `createRecords()`\n    * `updateRecords()`\n    * `deleteRecords()`\n    * `commit()`\n\n  For an example implementation, see `DS.RESTAdapter`, the\n  included REST adapter.\n\n  @class Adapter\n  @namespace DS\n  @extends Ember.Object\n  @uses DS._Mappable\n*/\n\nDS.Adapter = Ember.Object.extend(DS._Mappable, {\n\n  /**\n    The `find()` method is invoked when the store is asked for a record that\n    has not previously been loaded. In response to `find()` being called, you\n    should query your persistence layer for a record with the given ID. Once\n    found, you can asynchronously call the store's `push()` method to push\n    the record into the store.\n\n    Here is an example `find` implementation:\n\n        find: function(store, type, id) {\n          var url = type.url;\n          url = url.fmt(id);\n\n          jQuery.getJSON(url, function(data) {\n              // data is a hash of key/value pairs. If your server returns a\n              // root, simply do something like:\n              // store.push(type, id, data.person)\n              store.push(type, id, data);\n          });\n        }\n\n    @method find\n  */\n  find: Ember.required(Function),\n\n  /**\n    Optional\n\n    @method findAll\n    @param  store\n    @param  type\n    @param  since\n  */\n  findAll: null,\n\n  /**\n    Optional\n\n    @method findQuery\n    @param  store\n    @param  type\n    @param  query\n    @param  recordArray\n  */\n  findQuery: null,\n\n  /**\n    If the globally unique IDs for your records should be generated on the client,\n    implement the `generateIdForRecord()` method. This method will be invoked\n    each time you create a new record, and the value returned from it will be\n    assigned to the record's `primaryKey`.\n\n    Most traditional REST-like HTTP APIs will not use this method. Instead, the ID\n    of the record will be set by the server, and your adapter will update the store\n    with the new ID when it calls `didCreateRecord()`. Only implement this method if\n    you intend to generate record IDs on the client-side.\n\n    The `generateIdForRecord()` method will be invoked with the requesting store as\n    the first parameter and the newly created record as the second parameter:\n\n        generateIdForRecord: function(store, record) {\n          var uuid = App.generateUUIDWithStatisticallyLowOddsOfCollision();\n          return uuid;\n        }\n\n    @method generateIdForRecord\n    @param {DS.Store} store\n    @param {DS.Model} record\n  */\n  generateIdForRecord: null,\n\n  /**\n    Proxies to the serializer's `serialize` method.\n\n    @method serialize\n    @param {DS.Model} record\n    @param {Object}   options\n  */\n  serialize: function(record, options) {\n    return get(record, 'store').serializerFor(record.constructor.typeKey).serialize(record, options);\n  },\n\n  /**\n    Implement this method in a subclass to handle the creation of\n    new records.\n\n    Serializes the record and send it to the server.\n\n    This implementation should call the adapter's `didCreateRecord`\n    method on success or `didError` method on failure.\n\n    @method createRecord\n    @param {DS.Store} store\n    @param {subclass of DS.Model} type   the DS.Model class of the record\n    @param {DS.Model} record\n  */\n  createRecord: Ember.required(Function),\n\n  /**\n    Implement this method in a subclass to handle the updating of\n    a record.\n\n    Serializes the record update and send it to the server.\n\n    @method updateRecord\n    @param {DS.Store} store\n    @param {subclass of DS.Model} type   the DS.Model class of the record\n    @param {DS.Model} record\n  */\n  updateRecord: Ember.required(Function),\n\n  /**\n    Implement this method in a subclass to handle the deletion of\n    a record.\n\n    Sends a delete request for the record to the server.\n\n    @method deleteRecord\n    @param {DS.Store} store\n    @param {subclass of DS.Model} type   the DS.Model class of the record\n    @param {DS.Model} record\n  */\n  deleteRecord: Ember.required(Function),\n\n  /**\n    Find multiple records at once.\n\n    By default, it loops over the provided ids and calls `find` on each.\n    May be overwritten to improve performance and reduce the number of\n    server requests.\n\n    @method findMany\n    @param {DS.Store} store\n    @param {subclass of DS.Model} type   the DS.Model class of the records\n    @param {Array}    ids\n  */\n  findMany: function(store, type, ids) {\n    var promises = map.call(ids, function(id) {\n      return this.find(store, type, id);\n    }, this);\n\n    return Ember.RSVP.all(promises);\n  }\n});\n\n})();\n//@ sourceURL=ember-data/system/adapter");