global.fetch = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });