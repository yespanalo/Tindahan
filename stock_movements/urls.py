from django.urls import path
from .views import create_sale,get_sales

urlpatterns = [
    path('create_sale/',create_sale),
    path('get_sales/',get_sales),
]
