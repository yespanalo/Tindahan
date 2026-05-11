from django.contrib import admin
from .models import Price_History

@admin.register(Price_History)
class PriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('id','item_id','old_price','new_price','changed_at')
    search_fields = (['item_id__item_name'])
    list_filter = (['item_id'])