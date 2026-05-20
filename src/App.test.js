import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import App from './App';

test('renders settings button', async () => {
  await act(async () => {
    render(<App />);
  });
  const settingsButton = screen.getByTitle(/Settings/i);
  expect(settingsButton).toBeInTheDocument();
});
