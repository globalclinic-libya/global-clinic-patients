// src/App.test.jsx
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders login page with clinic name', () => {
    render(<App />);
    const clinicName = screen.getByText(/العيادة العالمية/i);
    const loginTitle = screen.getByText(/تسجيل الدخول/i);
    
    expect(clinicName).toBeInTheDocument();
    expect(loginTitle).toBeInTheDocument();
  });
});
