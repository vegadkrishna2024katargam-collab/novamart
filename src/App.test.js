import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders ecommerce storefront', () => {
  render(<App />);
  expect(screen.getAllByText(/NovaMart/i).length).toBeGreaterThan(0);
  expect(screen.getByText(/Premium products/i)).toBeInTheDocument();
});
