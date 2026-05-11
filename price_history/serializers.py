from rest_framework import serializers
from .models import Price_History

class PriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        meta = Price_History
        fields = ['id','item_id','old_price','new_price','changed_at']