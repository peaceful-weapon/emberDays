MemeTrain.Card = Ember.Object.extend({
    question: null,
    answer: null,
});

MemeTrain.Card = DS.Model.extend({
    question: DS.attr('string'),
    answer: DS.attr('string'),
});

MemeTrain.Card.FIXTURES = [{
    id: 1,
    question: 'France',
    answer: 'Paris'
}, {
    id: 2,
    question: 'Germany',
    answer: 'Berlin'
}];
