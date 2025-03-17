import { render, screen } from '@testing-library/react';
import App from './App';
import { MemoryRouter } from 'react-router-dom';

test('renders Book Community header', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const headerElement = screen.getByText(/Book Community/i);
  expect(headerElement).toBeInTheDocument();
});

test('renders Home page', () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  const homeElement = screen.getByText(/Search for books/i); // Adjust based on actual text in Home page
  expect(homeElement).toBeInTheDocument();
});

test('navigates to Profile page', () => {
  render(
    <MemoryRouter initialEntries={['/profile']}>
      <App />
    </MemoryRouter>
  );
  expect(screen.getByText(/Your Reviews/i)).toBeInTheDocument();
});
