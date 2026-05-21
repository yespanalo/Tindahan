from rest_framework import serializers
from .models import Stock_Movements

class StockMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock_Movements
        fields = ['id','item_id','movement_type','quantity','cost_price','created_at']