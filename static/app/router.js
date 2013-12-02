MemeTrain.Router.map(function(){
  this.resource('cards', { path: '/' });
});

MemeTrain.CardsRoute = Ember.Route.extend({
    model: function()
    {
    return this.store.find('card')
    }
});
