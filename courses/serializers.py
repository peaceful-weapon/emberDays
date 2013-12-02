from rest_framework import serializers
from courses.models import Course, Deck, Card

class courseSerializer(serializers.Serializer):
    pk = serializers.Field()
    title = serializers.CharField(required=False, max_length=150)

    #def restore_object(self, attrs, instance=None):
        #if instance:
            #instance.title = attrs.get('title', instance.title)
            #return instance
#
        #return course(**attrs)
