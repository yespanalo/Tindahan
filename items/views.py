from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Items
from .serializers import ItemsSerializer
from stock_movements.serializers import StockMovementSerializer
from price_history.serializers import PriceHistorySerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_items(request):
    try:
        items = Items.objects.all()
        serializer = ItemsSerializer(items,many=True)
        return Response({"success":True,"data":serializer.data})
    except Exception as e:
        return Response({"success:":False,"message":str(e)})
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_items(request):
    try:
        serializer = ItemsSerializer(data = request.data)
        if serializer.is_valid():
            item = serializer.save()
            
            cost_price = request.data.get('cost_price')
            if not cost_price:
                return Response({"success":False,"message":"cost price is required!"})
            
            
            stock_data = {
                'item_id': item.item_id,
                'movement_type': 'in',
                'quantity': item.current_stock,
                'cost_price':cost_price
            }
            
            stock_serializer = StockMovementSerializer(data=stock_data)
            if stock_serializer.is_valid():
                stock_serializer.save()
            else:
                return Response({"success":False,"message":stock_serializer.errors})
            
            price_history_data = {
                'item_id':item.item_id,
                'old_price':item.current_price,
                'new_price':item.current_price
            }
            
            price_history_serializer = PriceHistorySerializer(data = price_history_data)
            if price_history_serializer.is_valid():
                price_history_serializer.save()
            else:
                return Response({"success":False,"message":price_history_serializer.errors})
            
            return Response({"success":True,'data':serializer.data})
            
    except Exception as e:
        return Response({"success:":False,"message":str(e)})
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_selling_price(request):
    try:
        item_id_request = request.data.get('item_id')
        item = Items.objects.get(item_id=item_id_request)
        
        selling_price = request.data.get('selling_price')
        if selling_price is None:
            return Response({"success":True,"message":"selling_price is required"})
        if selling_price <0:
            return Response({"success":False,"message":"selling_price must be greater than 0"})
        
        item.current_price = selling_price
        item.save()
        
        serializer = ItemsSerializer(item)
        return Response({"success":True,"data":serializer.data})
        
    except Exception as e:
        return Response({"success":False,"message":str(e)})
    