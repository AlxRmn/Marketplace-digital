from django.shortcuts import render, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, FileResponse
from .models import Product
import json

@csrf_exempt
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        if not username or not password:
            return JsonResponse({'error': 'Username and password required'}, status=400)
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'User already exists'}, status=400)
        user = User.objects.create_user(username=username, password=password)
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'POST required'}, status=405)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)
    return JsonResponse({'error': 'POST required'}, status=405)

@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'POST required'}, status=405)

def profile(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    products = []
    for p in request.user.products.all():
        products.append({
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'image': p.image.url if p.image else None,
        })
    return JsonResponse({'username': request.user.username, 'products': products})

def products_list(request):
    products = []
    for p in Product.objects.all():
        products.append({
            'id': p.id,
            'name': p.name,
            'description': p.description,
            'price': p.price,
            'image': p.image.url if p.image else None,
        })
    return JsonResponse({'products': products})

@csrf_exempt
def buy_product(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    if request.method == 'POST':
        data = json.loads(request.body)
        product_id = data.get('product_id')
        try:
            product = Product.objects.get(id=product_id)
            request.user.products.add(product)
            return JsonResponse({'success': True})
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product not found'}, status=404)
    return JsonResponse({'error': 'POST required'}, status=405)

def download_product(request, product_id):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    product = get_object_or_404(Product, id=product_id)
    if product not in request.user.products.all():
        return JsonResponse({'error': 'Product not purchased'}, status=403)
    if not product.file:
        return JsonResponse({'error': 'No file available'}, status=404)
    return FileResponse(product.file, as_attachment=True)
