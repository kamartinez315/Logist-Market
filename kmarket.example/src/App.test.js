import { render, screen } from '@testing-library/react';
import App from './App';

test('renders KMarket dashboard', () => {
  render(<App />);
  const logoElement = screen.getByText(/KMarket/i);
  expect(logoElement).toBeInTheDocument();
});
