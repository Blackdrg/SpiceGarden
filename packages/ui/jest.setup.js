import '@testing-library/jest-dom';
import React from 'react';
React;
globalThis.fetch = () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
});
