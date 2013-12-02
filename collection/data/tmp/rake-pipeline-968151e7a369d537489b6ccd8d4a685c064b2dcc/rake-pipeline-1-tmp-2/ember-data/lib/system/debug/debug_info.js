minispade.register('ember-data/system/debug/debug_info', "(function() {minispade.require(\"ember-data/system/model/model\");\n\nDS.Model.reopen({\n\n  /**\n    Provides info about the model for debugging purposes\n    by grouping the properties into more semantic groups.\n\n    Meant to be used by debugging tools such as the Chrome Ember Extension.\n\n    - Groups all attributes in \"Attributes\" group.\n    - Groups all belongsTo relationships in \"Belongs To\" group.\n    - Groups all hasMany relationships in \"Has Many\" group.\n    - Groups all flags in \"Flags\" group.\n    - Flags relationship CPs as expensive properties.\n\n    @method _debugInfo\n    @for DS.Model\n    @private\n  */\n  _debugInfo: function() {\n    var attributes = ['id'],\n        relationships = { belongsTo: [], hasMany: [] },\n        expensiveProperties = [];\n\n    this.eachAttribute(function(name, meta) {\n      attributes.push(name);\n    }, this);\n\n    this.eachRelationship(function(name, relationship) {\n      relationships[relationship.kind].push(name);\n      expensiveProperties.push(name);\n    });\n\n    var groups = [\n      {\n        name: 'Attributes',\n        properties: attributes,\n        expand: true\n      },\n      {\n        name: 'Belongs To',\n        properties: relationships.belongsTo,\n        expand: true\n      },\n      {\n        name: 'Has Many',\n        properties: relationships.hasMany,\n        expand: true\n      },\n      {\n        name: 'Flags',\n        properties: ['isLoaded', 'isDirty', 'isSaving', 'isDeleted', 'isError', 'isNew', 'isValid']\n      }\n    ];\n\n    return {\n      propertyInfo: {\n        // include all other mixins / properties (not just the grouped ones)\n        includeOtherProperties: true,\n        groups: groups,\n        // don't pre-calculate unless cached\n        expensiveProperties: expensiveProperties\n      }\n    };\n  }\n\n});\n\n})();\n//@ sourceURL=ember-data/system/debug/debug_info");