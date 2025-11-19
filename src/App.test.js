import { render, screen } from '@testing-library/react';
import App from './App';

test('renders settings button', () => {
  render(<App />);
  const settingsButton = screen.getByTitle(/Settings/i);
  expect(settingsButton).toBeInTheDocument();
});
