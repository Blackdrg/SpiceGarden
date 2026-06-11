import '@testing-library/jest-dom';
import React from 'react';

(React as unknown as Record<string, unknown>);

(globalThis as unknown as Record<string, unknown>).fetch = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response);