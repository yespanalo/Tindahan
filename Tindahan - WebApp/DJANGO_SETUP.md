# Django Backend Integration Guide

This guide helps you set up your Django backend to work seamlessly with this frontend application.

---

## 🔧 Prerequisites

- Django 3.0+
- Django REST Framework
- django-cors-headers

---

## 📦 Installation

### Step 1: Install Required Packages

```bash
pip install django-cors-headers djangorestframework
```

### Step 2: Update Django Settings

Edit your `settings.py`:

```python
# settings.py

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'corsheaders',
    'rest_framework',
    
    # Your apps
    'your_app_name',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Add this FIRST
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    # Add your production URL here
]

# For development (allow all)
# CORS_ALLOW_ALL_ORIGINS = True

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}

# Token Configuration
TOKEN_EXPIRE_HOURS = 24  # Optional
```

---

## 🏗️ Models Setup

### Example Models for Items and Sales

```python
# models.py

from django.db import models
from django.contrib.auth.models import User

class Item(models.Model):
    item_name = models.CharField(max_length=255)
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    current_stock = models.IntegerField(default=0)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.item_name

    class Meta:
        ordering = ['-created_at']


class Sale(models.Model):
    MOVEMENT_CHOICES = [
        ('in', 'Stock In'),
        ('out', 'Stock Out'),
    ]

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='sales')
    movement_type = models.CharField(max_length=10, choices=MOVEMENT_CHOICES)
    quantity = models.IntegerField()
    cost_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.item.item_name} - {self.movement_type}"

    class Meta:
        ordering = ['-created_at']
```

---

## 📡 Serializers

### Create Serializers

```python
# serializers.py

from rest_framework import serializers
from .models import Item, Sale
from django.contrib.auth.models import User

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = ['id', 'item_name', 'current_price', 'current_stock', 'cost_price', 'created_at', 'updated_at']


class SaleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sale
        fields = ['id', 'item', 'movement_type', 'quantity', 'cost_price', 'created_at', 'created_by']

    def create(self, validated_data):
        sale = Sale.objects.create(**validated_data)
        
        # Update item stock based on movement type
        item = validated_data['item']
        if validated_data['movement_type'] == 'in':
            item.current_stock += validated_data['quantity']
        else:
            item.current_stock -= validated_data['quantity']
        
        item.save()
        return sale


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
```

---

## 🔐 Views & Authentication

### Authentication Views

```python
# views.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_200_OK
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .serializers import UserSerializer, ChangePasswordSerializer
from django.db import transaction

# Login endpoint
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    Login endpoint
    Expected POST data: {"email": "...", "password": "..."}
    Returns: {"token": "...", "user": {...}}
    """
    if request.method == 'POST':
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'detail': 'Email and password are required'},
                status=HTTP_400_BAD_REQUEST
            )
        
        # Try to find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'detail': 'Invalid credentials'},
                status=HTTP_400_BAD_REQUEST
            )
        
        # Authenticate with username
        user = authenticate(username=user.username, password=password)
        
        if not user:
            return Response(
                {'detail': 'Invalid credentials'},
                status=HTTP_400_BAD_REQUEST
            )
        
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })


# Logout endpoint
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Logout endpoint - deletes the user's token
    """
    request.user.auth_token.delete()
    return Response({'detail': 'Successfully logged out'}, status=HTTP_200_OK)


# Get current user
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Get current user information
    """
    return Response(UserSerializer(request.user).data)


# Change password
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change user password
    Expected data: {"current_password": "...", "new_password": "..."}
    """
    serializer = ChangePasswordSerializer(data=request.data)
    
    if serializer.is_valid():
        user = request.user
        
        # Check current password
        if not user.check_password(serializer.data.get('current_password')):
            return Response(
                {'detail': 'Current password is incorrect'},
                status=HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(serializer.data.get('new_password'))
        user.save()
        
        return Response({'detail': 'Password changed successfully'}, status=HTTP_200_OK)
    
    return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)
```

### Items Views

```python
from rest_framework import viewsets, status
from .models import Item, Sale
from .serializers import ItemSerializer, SaleSerializer

class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Create new item"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update_price(self, request, *args, **kwargs):
        """Custom action to update item price"""
        item_id = request.data.get('item_id')
        new_price = request.data.get('new_price')
        
        try:
            item = Item.objects.get(id=item_id)
            item.current_price = new_price
            item.save()
            return Response(ItemSerializer(item).data)
        except Item.DoesNotExist:
            return Response(
                {'detail': 'Item not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Create sale/movement
        Automatically updates item stock
        """
        item_id = request.data.get('item_id')
        movement_type = request.data.get('movement_type')
        quantity = request.data.get('quantity')
        cost_price = request.data.get('cost_price')

        try:
            item = Item.objects.get(id=item_id)
        except Item.DoesNotExist:
            return Response(
                {'detail': 'Item not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validate stock out
        if movement_type == 'out' and item.current_stock < quantity:
            return Response(
                {'detail': 'Insufficient stock'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create sale with transaction
        with transaction.atomic():
            sale_data = {
                'item_id': item_id,
                'movement_type': movement_type,
                'quantity': quantity,
                'created_by': request.user
            }
            
            if movement_type == 'in' and cost_price:
                sale_data['cost_price'] = cost_price
            
            sale = Sale.objects.create(**sale_data)
            
            # Update stock
            if movement_type == 'in':
                item.current_stock += quantity
            else:
                item.current_stock -= quantity
            
            item.save()

        return Response(SaleSerializer(sale).data, status=status.HTTP_201_CREATED)
```

---

## 🛣️ URL Configuration

### Setup URLs

```python
# urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken import views as authtoken_views
from . import views

router = DefaultRouter()
router.register(r'items', views.ItemViewSet, basename='item')
router.register(r'sales', views.SaleViewSet, basename='sale')

urlpatterns = [
    path('', include(router.urls)),
    
    # Auth endpoints
    path('admins/login/', views.login, name='login'),
    path('admins/logout/', views.logout, name='logout'),
    path('admins/me/', views.get_current_user, name='current_user'),
    path('admins/change_password/', views.change_password, name='change_password'),
    
    # Create item endpoint
    path('create_items/', views.ItemViewSet.as_view({'post': 'create'}), name='create_item'),
    
    # Update price endpoint
    path('update_item_price/', views.ItemViewSet.as_view({'put': 'update_price'}), name='update_price'),
    
    # Create sale endpoint
    path('create_sale/', views.SaleViewSet.as_view({'post': 'create'}), name='create_sale'),
]
```

### Update main urls.py

```python
# project/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('your_app_name.urls')),
]
```

---

## 🗄️ Database Migrations

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

---

## ✅ Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/admins/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get current user
curl -X GET http://localhost:8000/api/admins/me/ \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create item
curl -X POST http://localhost:8000/api/create_items/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "item_name":"Pancit Canton",
    "current_price":14,
    "current_stock":2,
    "cost_price":10
  }'

# Create sale (stock in)
curl -X POST http://localhost:8000/api/create_sale/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "item_id":1,
    "movement_type":"in",
    "quantity":6,
    "cost_price":9
  }'
```

### Using Postman
1. Import the collection from `postman_collection.json` (if provided)
2. Set `base_url` to `http://localhost:8000/api`
3. First request should be login to get token
4. Use token in subsequent requests

---

## 🔒 Security Checklist

- [ ] CORS_ALLOWED_ORIGINS configured properly
- [ ] DEBUG = False in production
- [ ] SECRET_KEY is strong and unique
- [ ] ALLOWED_HOSTS configured
- [ ] HTTPS enforced in production
- [ ] Token expiration implemented
- [ ] Input validation on all endpoints
- [ ] Rate limiting configured
- [ ] SQL injection protection (Django ORM)
- [ ] CSRF tokens for form submission

---

## 🚀 Running the Application

### Terminal 1: Django Backend
```bash
python manage.py runserver 0.0.0.0:8000
```

### Terminal 2: Frontend Server
```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node.js
npx http-server -p 8080
```

### Access the Application
- Frontend: http://localhost:8080
- API: http://127.0.0.1:8000/api
- Admin: http://127.0.0.1:8000/admin

---

## 📝 Common Issues

### Issue: CORS Error
**Solution**: Ensure `corsheaders` is installed and configured:
```python
INSTALLED_APPS = ['corsheaders', ...]
MIDDLEWARE = ['corsheaders.middleware.CorsMiddleware', ...]
CORS_ALLOWED_ORIGINS = ["http://localhost:8080"]
```

### Issue: 404 on API endpoints
**Solution**: Check URL configuration and ensure endpoints are properly registered

### Issue: 401 Unauthorized
**Solution**: Ensure token is being passed in Authorization header:
```
Authorization: Bearer <token>
```

### Issue: Stock becomes negative
**Solution**: Add validation in `create` method:
```python
if movement_type == 'out' and item.current_stock < quantity:
    raise ValidationError('Insufficient stock')
```

---

## 📚 Additional Resources

- Django REST Framework: https://www.django-rest-framework.org/
- Django Docs: https://docs.djangoproject.com/
- Token Authentication: https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication

---

**Last Updated**: May 2026
