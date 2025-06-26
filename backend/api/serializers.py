from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims to the token
        token['username'] = user.username
        token['role'] = user.role
        return token


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # Add password as a write-only field

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'name', 'role', 'password', 'is_active', 'is_admin']
        read_only_fields = ['is_active', 'is_admin']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)  
            user.save()
        return user

class AppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['appointment_id', 'status', 'mentor_id', 'mentee_id', 'start_time', 'end_time', 'date']

class MentorDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentorDetails
        fields = '__all__'
        extra_kwargs = {
            'cumulative_rating': {'required': False},
            'description': {'required': False},
            'specialization': {'required': False},
            'college': {'required': False},
            'avatar' : {'required' : False},
        }

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['review_id', 'mentee_id', 'mentor_id', 'rating', 'comment']

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['favorite_id', 'mentee_id', 'mentor_id']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['message_id', 'sender_id', 'receiver_id', 'content', 'time']
