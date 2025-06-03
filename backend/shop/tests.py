from django.test import TestCase, Client
from django.contrib.auth.models import User
from .models import Product
from django.core.files.uploadedfile import SimpleUploadedFile
import json

# Create your tests here.

class ProductModelTest(TestCase):
    def setUp(self):
        self.product = Product.objects.create(
            name="Test Product",
            description="Test Description",
            price=99.99
        )

    def test_product_creation(self):
        self.assertEqual(self.product.name, "Test Product")
        self.assertEqual(self.product.description, "Test Description")
        self.assertEqual(float(self.product.price), 99.99)
        self.assertEqual(str(self.product), "Test Product")

class ViewsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )
        self.product = Product.objects.create(
            name="Test Product",
            description="Test Description",
            price=99.99
        )

    def test_register(self):
        response = self.client.post(
            '/api/register/',
            json.dumps({'username': 'newuser', 'password': 'newpass123'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.filter(username='newuser').exists())

    def test_login(self):
        response = self.client.post(
            '/api/login/',
            json.dumps({'username': 'testuser', 'password': 'testpass123'}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)

    def test_products_list(self):
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(len(data['products']), 1)
        self.assertEqual(data['products'][0]['name'], "Test Product")

    def test_buy_product(self):
        # Login first
        self.client.post(
            '/api/login/',
            json.dumps({'username': 'testuser', 'password': 'testpass123'}),
            content_type='application/json'
        )
        
        # Try to buy product
        response = self.client.post(
            '/api/buy/',
            json.dumps({'product_id': self.product.id}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        
        # Check if product was added to user's products
        self.assertTrue(self.product in self.user.products.all())

    def test_profile(self):
        # Login first
        self.client.post(
            '/api/login/',
            json.dumps({'username': 'testuser', 'password': 'testpass123'}),
            content_type='application/json'
        )
        
        # Add product to user
        self.user.products.add(self.product)
        
        # Check profile
        response = self.client.get('/api/profile/')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['username'], 'testuser')
        self.assertEqual(len(data['products']), 1)
        self.assertEqual(data['products'][0]['name'], "Test Product")
