from rest_framework import serializers
from .models import Items

class ItemsSerializer(serializers.ModelSerializer):
    class Meta:
        meta = Items
        fields = ['item_id','item_name','current_price','current_stock','created_at','updated_at']