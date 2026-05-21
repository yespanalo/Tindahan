from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminViewSet

# Create a router and register the viewset
router = DefaultRouter()
router.register(r'admins', AdminViewSet, basename='admin')

# URL patterns
urlpatterns = [
    path('', include(router.urls)),
]

# The above will automatically create these endpoints:
# POST   /admins/                     - Create new admin
# GET    /admins/                     - List all admins
# GET    /admins/{id}/                - Retrieve specific admin
# PUT    /admins/{id}/                - Update admin
# PATCH  /admins/{id}/                - Partial update admin
# DELETE /admins/{id}/                - Delete admin
# 
# Custom endpoints:
# POST   /admins/login/               - Login
# POST   /admins/logout/              - Logout
# POST   /admins/create_superuser/    - Create superuser
# GET    /admins/me/                  - Get current user details
# PUT    /admins/change_password/     - Change password