from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token  
from django.contrib.auth import authenticate

from .models import Admin
from .serializers import (
    AdminSerializer,
    AdminCreateSerializer,
    AdminUpdateSerializer,
    SuperAdminCreateSerializer
)


class AdminViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Admin model with custom create, update, and login actions
    """
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        """
        Override permissions for specific actions
        """
        if self.action == 'create':
            permission_classes = [AllowAny]  # Allow anyone to register
        elif self.action == 'login':
            permission_classes = [AllowAny]  # Allow unauthenticated login
        else:
            permission_classes = [IsAuthenticated]  # Require auth for other actions
        
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        """
        Return appropriate serializer based on action
        """
        if self.action == 'create':
            return AdminCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return AdminUpdateSerializer
        elif self.action == 'create_superuser':
            return SuperAdminCreateSerializer
        return AdminSerializer

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """
        Admin login endpoint
        Expects: {
            "username": "admin_username",
            "password": "admin_password"
        }
        """
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'Username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is not None and isinstance(user, Admin):
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': AdminSerializer(user).data
            }, status=status.HTTP_200_OK)

        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        """
        Logout endpoint - deletes the auth token
        """
        try:
            token = Token.objects.get(user=request.user)
            token.delete()
            return Response(
                {'message': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
        except Token.DoesNotExist:
            return Response(
                {'error': 'Token not found'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def create_superuser(self, request):
        """
        Create a superuser
        Requires staff/superuser permission in a real app
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        Get current user details
        """
        serializer = AdminSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put'], permission_classes=[IsAuthenticated])
    def change_password(self, request):
        """
        Change password for the logged-in user
        Expects: {
            "old_password": "current_password",
            "new_password": "new_password",
            "confirm_password": "new_password"
        }
        """
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not old_password or not new_password or not confirm_password:
            return Response(
                {'error': 'All password fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.check_password(old_password):
            return Response(
                {'error': 'Old password is incorrect'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {'error': 'New passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )