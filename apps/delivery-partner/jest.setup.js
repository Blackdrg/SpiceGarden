/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-vars */
import '@testing-library/jest-dom';

globalThis.fetch = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
