import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const titleElement = screen.getByText(/T2Get/i);
  expect(titleElement).toBeInTheDocument();
});
