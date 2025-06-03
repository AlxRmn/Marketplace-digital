import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import './App.css';

function Register({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/shop/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setError('');
        onSuccess();
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="form-section">
      <h2>Регистрация</h2>
      {success && <p className="success">Регистрация успешна! Теперь вы можете войти.</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}

function Login({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/shop/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        setError('');
        onSuccess();
        navigate('/profile');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="form-section">
      <h2>Вход</h2>
      {success && <p className="success">Вход выполнен!</p>}
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

function Profile({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:8000/shop/profile/', { credentials: 'include' });
        const data = await response.json();
        if (response.ok) {
          setProfile(data);
        } else {
          setError(data.error);
          navigate('/login');
        }
      } catch (err) {
        setError('An error occurred');
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8000/shop/logout/', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        onLogout();
        navigate('/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDownload = async (productId, productName) => {
    try {
      const response = await fetch(`http://localhost:8000/shop/download/${productId}/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = productName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert('Ошибка скачивания файла');
      }
    } catch (err) {
      alert('Ошибка скачивания файла');
    }
  };

  if (error) return <div className="section"><p className="error">{error}</p></div>;
  if (!profile) return <div className="section">Загрузка...</div>;

  return (
    <div className="section">
      <h2>Профиль</h2>
      <div className="profile-info">
        <span className="profile-label">Имя пользователя:</span> <b>{profile.username}</b>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Выйти</button>
      <h3>Купленные товары</h3>
      <div className="products-list">
        {profile.products.length === 0 && <p>Нет купленных товаров.</p>}
        {profile.products.map((product) => (
          <div className="product-card" key={product.id}>
            {product.image && (
              <div className="product-logo-wrap">
                <img src={`http://localhost:8000${product.image}`} alt="logo" className="product-logo" />
              </div>
            )}
            <div>
              <div className="product-title">{product.name}</div>
              <div className="product-desc">{product.description}</div>
              <div className="product-price">Цена: <b>{product.price} ₽</b></div>
            </div>
            <button className="download-btn" onClick={() => handleDownload(product.id, product.name)}>Скачать файл</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8000/shop/products/');
        const data = await response.json();
        if (response.ok) {
          setProducts(data.products);
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('An error occurred');
      }
    };
    fetchProducts();
  }, []);

  const handleBuy = async (productId) => {
    try {
      const response = await fetch('http://localhost:8000/shop/buy/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        alert('Товар куплен!');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Ошибка покупки');
    }
  };

  if (error) return <div className="section"><p className="error">{error}</p></div>;

  return (
    <div className="section">
      <h2>Каталог товаров</h2>
      <div className="products-list">
        {products.length === 0 && <p>Нет товаров.</p>}
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            {product.image && (
              <div className="product-logo-wrap">
                <img src={`http://localhost:8000${product.image}`} alt="logo" className="product-logo" />
              </div>
            )}
            <div>
              <div className="product-title">{product.name}</div>
              <div className="product-desc">{product.description}</div>
              <div className="product-price">Цена: <b>{product.price} ₽</b></div>
            </div>
            <button className="buy-btn" onClick={() => handleBuy(product.id)}>Купить</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2025 Магазин цифровых товаров. Все права защищены.</p>
      </div>
    </footer>
  );
}

function Navigation({ isAuthenticated, onLogout }) {
  return (
    <nav>
      <ul>
        <li><Link to="/products">Каталог</Link></li>
        {isAuthenticated ? (
          <>
            <li><Link to="/profile">Профиль</Link></li>
            <li><Link to="/login" onClick={async (e) => {
              e.preventDefault();
              try {
                await fetch('http://localhost:8000/shop/logout/', {
                  method: 'POST',
                  credentials: 'include',
                });
                onLogout();
                window.location.href = '/login';
              } catch (err) {
                console.error('Logout error:', err);
              }
            }}>Выйти</Link></li>
          </>
        ) : (
          <>
            <li><Link to="/register">Регистрация</Link></li>
            <li><Link to="/login">Вход</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async () => {
    try {
      const response = await fetch('http://localhost:8000/shop/profile/', { credentials: 'include' });
      setIsAuthenticated(response.ok);
    } catch (err) {
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <Router>
      <div className="App">
        <Navigation isAuthenticated={isAuthenticated} onLogout={() => setIsAuthenticated(false)} />
        <Routes>
          <Route path="/register" element={<Register onSuccess={() => checkAuth()} />} />
          <Route path="/login" element={<Login onSuccess={() => checkAuth()} />} />
          <Route path="/profile" element={<Profile onLogout={() => setIsAuthenticated(false)} />} />
          <Route path="/products" element={<Products />} />
          <Route path="/" element={<Navigate to="/products" />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
