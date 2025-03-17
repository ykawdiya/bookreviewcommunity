// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { server } from './mocks/server';

beforeAll(() => {
  console.log("✅ Mock server is starting...");
  server.listen();
});

afterEach(() => {
  console.log("🔄 Resetting mock handlers...");
  server.resetHandlers();
});

afterAll(() => {
  console.log("🛑 Stopping mock server...");
  server.close();
});
