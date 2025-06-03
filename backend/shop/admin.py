from django.contrib import admin
from .models import Product
from django.utils.html import format_html

class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'logo_preview')
    readonly_fields = ('logo_preview',)

    def logo_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height: 60px; max-width: 60px;" />', obj.image.url)
        return "(нет)"
    logo_preview.short_description = 'Логотип'

admin.site.register(Product, ProductAdmin)
