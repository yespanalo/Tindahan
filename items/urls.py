from django.urls import path
from .views import create_items,get_items

urlpatterns = [
    path('get_items/',get_items),
    path('create_items/',create_items),
]
