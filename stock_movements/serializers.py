from rest_framework import serializers
from .models import Stock_Movements

class StockMovementSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item_id.item_name', read_only=True)
    class Meta:
        model = Stock_Movements
        fields = ['id','item_id','item_name','movement_type','quantity','cost_price','created_at','sell_price']