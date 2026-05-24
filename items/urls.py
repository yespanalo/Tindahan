from django.urls import path
from .views import create_items,get_items, update_selling_price

urlpatterns = [
    path('get_items/',get_items),
    path('create_items/',create_items),
    path('update_selling_price/',update_selling_price),
]
