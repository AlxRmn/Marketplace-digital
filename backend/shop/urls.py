from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('products/', views.products_list, name='products'),
    path('buy/', views.buy_product, name='buy'),
    path('download/<int:product_id>/', views.download_product, name='download'),
] 