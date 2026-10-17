import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
  // The app keeps its question in the address, which jsdom keeps from one
  // test to the next within a file.
  history.replaceState(null, '', '/');
});
