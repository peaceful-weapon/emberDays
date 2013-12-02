minispade.register('ember-data/transforms/date', "(function() {DS.DateTransform = DS.Transform.extend({\n\n  deserialize: function(serialized) {\n    var type = typeof serialized;\n\n    if (type === \"string\") {\n      return new Date(Ember.Date.parse(serialized));\n    } else if (type === \"number\") {\n      return new Date(serialized);\n    } else if (serialized === null || serialized === undefined) {\n      // if the value is not present in the data,\n      // return undefined, not null.\n      return serialized;\n    } else {\n      return null;\n    }\n  },\n\n  serialize: function(date) {\n    if (date instanceof Date) {\n      var days = [\"Sun\", \"Mon\", \"Tue\", \"Wed\", \"Thu\", \"Fri\", \"Sat\"];\n      var months = [\"Jan\", \"Feb\", \"Mar\", \"Apr\", \"May\", \"Jun\", \"Jul\", \"Aug\", \"Sep\", \"Oct\", \"Nov\", \"Dec\"];\n\n      var pad = function(num) {\n        return num < 10 ? \"0\"+num : \"\"+num;\n      };\n\n      var utcYear = date.getUTCFullYear(),\n          utcMonth = date.getUTCMonth(),\n          utcDayOfMonth = date.getUTCDate(),\n          utcDay = date.getUTCDay(),\n          utcHours = date.getUTCHours(),\n          utcMinutes = date.getUTCMinutes(),\n          utcSeconds = date.getUTCSeconds();\n\n\n      var dayOfWeek = days[utcDay];\n      var dayOfMonth = pad(utcDayOfMonth);\n      var month = months[utcMonth];\n\n      return dayOfWeek + \", \" + dayOfMonth + \" \" + month + \" \" + utcYear + \" \" +\n             pad(utcHours) + \":\" + pad(utcMinutes) + \":\" + pad(utcSeconds) + \" GMT\";\n    } else {\n      return null;\n    }\n  } \n\n});\n\n})();\n//@ sourceURL=ember-data/transforms/date");