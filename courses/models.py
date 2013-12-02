from django.db import models

class Deck(models.Model):
    title = models.CharField(max_length=100)
    course = models.ForeignKey('Course')

class Course(models.Model):
    title = models.CharField(max_length=100)

class Card(models.Model):
    answer = models.CharField(max_length=150)
    question = models.CharField(max_length=150)
    deck = models.ForeignKey(Deck)
