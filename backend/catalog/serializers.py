from rest_framework import serializers
from .models import Institution, Field, Favorite

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = '__all__'

class FieldSerializer(serializers.ModelSerializer):
    institutions = InstitutionSerializer(many=True, read_only=True) # Nested serializer for institutions

    class Meta:
        model = Field
        fields = '__all__'

class FavoriteSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username') # Display username instead of user id
    field_name = serializers.ReadOnlyField(source='field.name') # Display field name

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'field', 'field_name', 'added_at']
        read_only_fields = ['user']