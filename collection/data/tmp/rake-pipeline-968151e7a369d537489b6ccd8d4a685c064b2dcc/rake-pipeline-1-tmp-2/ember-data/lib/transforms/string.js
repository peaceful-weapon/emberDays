minispade.register('ember-data/transforms/string', "(function() {var none = Ember.isNone;\n\nDS.StringTransform = DS.Transform.extend({\n\n  deserialize: function(serialized) {\n    return none(serialized) ? null : String(serialized);\n  },\n\n  serialize: function(deserialized) {\n    return none(deserialized) ? null : String(deserialized);\n  }\n\n});\n\n})();\n//@ sourceURL=ember-data/transforms/string");