from rest_framework import serializers
from .models import User, StudentProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2', 'role']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2') # Remove password2 as it's not part of the User model
        user = User.objects.create_user(**validated_data)
        
        # If the user is a student, create a StudentProfile
        if user.role == 'student':
            StudentProfile.objects.create(user=user)
            
        return user

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        # Add fields from StudentProfile model that you want to expose/update
        # For now, it might be empty if StudentProfile has no extra fields yet,
        # but it's good to have it for future expansion.
        fields = [] # Example: ['date_of_birth', 'academic_level']

class UserSerializer(serializers.ModelSerializer):
    student_profile = StudentProfileSerializer(read_only=True) # Nested serializer for StudentProfile

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'student_profile']

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    class Meta:
        fields = ['email']

class PasswordResetConfirmSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, min_length=6)
    uid = serializers.CharField()
    token = serializers.CharField()

    class Meta:
        fields = ['password', 'password2', 'uid', 'token']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return data

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        
        return token

class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['date_joined', 'last_login']
