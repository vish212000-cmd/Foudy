from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from profiles.models import Profile

User = get_user_model()

class ProfileSerializer(serializers.ModelSerializer):
    completion_score = serializers.ReadOnlyField()

    class Meta:
        model = Profile
        fields = [
            'display_name', 'avatar', 'bio', 'interests', 
            'keywords', 'languages', 'country', 'gender_preference', 
            'privacy_settings', 'notification_settings', 'completion_score'
        ]

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'is_guest', 'profile']

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    display_name = serializers.CharField(max_length=100)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class GuestUpgradeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, validators=[validate_password])

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, validators=[validate_password])

class EmailVerificationRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class EmailVerificationConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()

class GoogleLoginSerializer(serializers.Serializer):
    access_token = serializers.CharField()
