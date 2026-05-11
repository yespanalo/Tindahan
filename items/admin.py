from django.contrib import admin
from .models import Items

@admin.register(Items)
class ItemsAdmin(admin.ModelAdmin):
    list_display = ('item_id','item_name','current_price','current_stock','created_at','updated_at')
    search_fields = (['item_name'])