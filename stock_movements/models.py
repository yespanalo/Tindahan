from django.db import models
from items.models import Items


class Stock_Movements(models.Model):
    id = models.AutoField(primary_key=True)
    item_id = models.ForeignKey(
        Items,
        on_delete=models.CASCADE,
        related_name= 'stock_entries',
        null=False,
        blank=False
    )
    movement_type = models.CharField(choices=[('in','In'),('out','Out')])
    quantity = models.IntegerField(null=False,blank=False)
    cost_price = models.FloatField(null=True,blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    sell_price = models.FloatField(null=True,blank=False)
    
    def __str__(self):
        return self.item_id.item_name