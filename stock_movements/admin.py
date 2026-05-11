from django.contrib import admin
from .models import Stock_Movements

@admin.register(Stock_Movements)
class StockMovementsAdmin(admin.ModelAdmin):
    list_display = ('id','item_id','movement_type','quantity','cost_price','created_at')