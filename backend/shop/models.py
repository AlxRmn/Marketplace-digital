from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Product(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    file = models.FileField(upload_to='products/', null=True, blank=True)
    image = models.ImageField(upload_to='product_logos/', null=True, blank=True)

    def __str__(self):
        return self.name

# Добавим связь ManyToMany через User.profile позже, если потребуется кастомизация профиля
User.add_to_class('products', models.ManyToManyField(Product, blank=True, related_name='buyers'))
