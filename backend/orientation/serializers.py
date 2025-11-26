from rest_framework import serializers
from .models import Question, OrientationTest, TestResponse, Recommendation
from accounts.serializers import UserSerializer # For nested user representation
from catalog.serializers import FieldSerializer # For nested field representation

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = '__all__'

class TestResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResponse
        fields = '__all__'
        read_only_fields = ['orientation_test'] # OrientationTest will be set by the view

class RecommendationSerializer(serializers.ModelSerializer):
    # If recommended_fields stores IDs, you might want to serialize the actual Field objects
    # recommended_fields = FieldSerializer(many=True, read_only=True)

    class Meta:
        model = Recommendation
        fields = '__all__'

class OrientationTestSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True) # Display user details
    responses = TestResponseSerializer(many=True, read_only=True) # Nested responses
    recommendation = RecommendationSerializer(read_only=True) # Nested recommendation

    class Meta:
        model = OrientationTest
        fields = '__all__'
