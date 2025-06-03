import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock fetch function
global.fetch = jest.fn();

describe('App Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    fetch.mockClear();
  });

  test('renders login form', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByPlaceholderText('Имя пользователя')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль')).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  test('handles login submission', async () => {
    // Mock successful login response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Имя пользователя'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'testpass' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Войти'));

    // Check if fetch was called with correct parameters
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/shop/login/',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'testuser',
            password: 'testpass',
          }),
        })
      );
    });
  });

  test('handles registration submission', async () => {
    // Mock successful registration response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Click register link
    fireEvent.click(screen.getByText('Регистрация'));

    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Имя пользователя'), {
      target: { value: 'newuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль'), {
      target: { value: 'newpass' },
    });

    // Submit the form
    fireEvent.click(screen.getByText('Зарегистрироваться'));

    // Check if fetch was called with correct parameters
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/shop/register/',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'newuser',
            password: 'newpass',
          }),
        })
      );
    });
  });

  test('displays products list', async () => {
    // Mock products response
    const mockProducts = {
      products: [
        {
          id: 1,
          name: 'Test Product',
          description: 'Test Description',
          price: '99.99',
        },
      ],
    };

    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProducts),
      })
    );

    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    // Click products link
    fireEvent.click(screen.getByText('Товары'));

    // Check if products are displayed
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('99.99 ₽')).toBeInTheDocument();
    });
  });
}); 