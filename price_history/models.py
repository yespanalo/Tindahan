from django.db import models
from items.models import Items


class Price_History(models.Model):
    id = models.AutoField(primary_key=True)
    item_id = models.ForeignKey(
        Items,
        on_delete=models.CASCADE,
        related_name= 'price_history',
        null=False,
        blank=False
    )
    old_price = models.FloatField()
    new_price = models.FloatField()
    changed_at = models.DateTimeField(auto_now=True)