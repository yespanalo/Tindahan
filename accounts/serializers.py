from rest_framework import serializers
from .models import Admin  # Adjust import path based on your app structure


# Basic Serializer - Read-only representation
class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = [
            'id',
            'username',
            'email',
            'full_name',
            'is_active',
            'is_staff',
            'last_login',
            'created_at'
        ]
        read_only_fields = [
            'id',
            'last_login',
            'created_at'
        ]


# Serializer for User Registration/Creation
class AdminCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        help_text='Leave empty if no change needed',
        trim_whitespace=False
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    class Meta:
        model = Admin
        fields = [
            'username',
            'email',
            'full_name',
            'password',
            'password_confirm'
        ]

    def validate(self, data):
        """Validate that both passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data

    def create(self, validated_data):
        """Create admin user with hashed password"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        admin = Admin.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            full_name=validated_data['full_name']
        )
        return admin


# Serializer for Admin Update/Patch
class AdminUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
        help_text='Leave empty if no change needed',
        trim_whitespace=False
    )

    class Meta:
        model = Admin
        fields = [
            'username',
            'email',
            'full_name',
            'is_active',
            'is_staff',
            'password'
        ]
        read_only_fields = ['username']  # Prevent username changes

    def update(self, instance, validated_data):
        """Update admin user, handling password separately"""
        password = validated_data.pop('password', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


# Serializer for Superuser Creation
class SuperAdminCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        trim_whitespace=False
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
        trim_whitespace=False
    )

    class Meta:
        model = Admin
        fields = [
            'username',
            'email',
            'full_name',
            'password',
            'password_confirm'
        ]

    def validate(self, data):
        """Validate that both passwords match"""
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return data

    def create(self, validated_data):
        """Create superuser"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        admin = Admin.objects.create_superuser(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            full_name=validated_data['full_name']
        )
        return admin