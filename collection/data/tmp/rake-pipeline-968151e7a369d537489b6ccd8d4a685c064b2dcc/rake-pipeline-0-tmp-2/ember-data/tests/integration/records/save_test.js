minispade.register('ember-data/~tests/integration/records/save_test', "(function() {var Comment, Post, env;\n\nmodule(\"integration/records/save - Save Record\", {\n  setup: function() {\n    var Post = DS.Model.extend({\n      title: DS.attr('string')\n    });\n\n    Post.toString = function() { return \"Post\"; };\n\n    env = setupStore({ post: Post });\n  },\n\n  teardown: function() {\n    env.container.destroy();\n  }\n});\n\ntest(\"Will resolve save on success\", function() {\n  expect(1);\n  var post = env.store.createRecord('post', {title: 'toto'});\n\n  env.adapter.createRecord = function(store, type, record) {\n    return Ember.RSVP.resolve({ id: 123 });\n  };\n\n  post.save().then(async(function() {\n    ok(true, 'save operation was resolved');\n  }));\n});\n\ntest(\"Will reject save on error\", function() {\n  var post = env.store.createRecord('post', {title: 'toto'});\n\n  env.adapter.createRecord = function(store, type, record) {\n    return Ember.RSVP.reject();\n  };\n\n  post.save().then(function() {}, async(function() {\n    ok(true, 'save operation was rejected');\n  }));\n});\n\ntest(\"Retry is allowed in a failure handler\", function() {\n  var post = env.store.createRecord('post', {title: 'toto'});\n\n  var count = 0;\n\n  env.adapter.createRecord = function(store, type, record) {\n    if (count++ === 0) {\n      return Ember.RSVP.reject();\n    } else {\n      return Ember.RSVP.resolve({ id: 123 });\n    }\n  };\n\n  post.save().then(function() {}, async(function() {\n    return post.save();\n  })).then(async(function(post) {\n    equal(post.get('id'), '123', \"The post ID made it through\");\n  }));\n});\n\ntest(\"Will reject save on invalid\", function() {\n  expect(1);\n  var post = env.store.createRecord('post', {title: 'toto'});\n\n  env.adapter.createRecord = function(store, type, record) {\n    return Ember.RSVP.reject({ title: 'invalid' });\n  };\n\n  post.save().then(function() {}, async(function() {\n    ok(true, 'save operation was rejected');\n  }));\n});\n\n})();\n//@ sourceURL=ember-data/~tests/integration/records/save_test");