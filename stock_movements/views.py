from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Items,Stock_Movements
from .serializers import StockMovementSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_sale(request):
    try:
        serializer = StockMovementSerializer(data = request.data)
        if serializer.is_valid():
            movement = serializer.save()
            
            if movement.movement_type == 'out':
                item = Items.objects.get(item_id = movement.item_id.item_id)
                
                if item.current_stock < movement.quantity:
                    movement.delete()
                    return Response({"success":False,"message":"Insufficient stock!"})

                item.current_stock -= movement.quantity
                item.save()
                
                movement.sell_price = item.current_price  
                movement.save()
                
            elif movement.movement_type == 'in':
                if not movement.cost_price:
                    return Response({"success":False,"message":"cost price is required!"})
                
                item = Items.objects.get(item_id = movement.item_id.item_id)
                item.current_stock += movement.quantity
                item.save()
            
            updated_serializer = StockMovementSerializer(movement)    
            return Response({"success":True,"data":updated_serializer.data})
        else:
            return Response({"success": False, "message": serializer.errors})
        
        
    except Items.DoesNotExist:
        return Response({"success":False,"message":"Item not found"})
    except Exception as e:
        return Response({"success":False,"message":str(e)})
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sales(request):
    try:
        sales = Stock_Movements.objects.filter(movement_type = 'out')
        serializer = StockMovementSerializer(sales,many = True)
        return Response({"success":True,"data":serializer.data})
    except Exception as e:
        return Response({"success":False,"message":str(e)})