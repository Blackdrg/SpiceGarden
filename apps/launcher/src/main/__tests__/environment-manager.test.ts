import { EnvironmentManager } from '../environment-manager';

describe('EnvironmentManager', () => {
  it('accepts the current Node.js major version', () => {
    const manager = new EnvironmentManager({} as never);
    expect((manager as unknown as { checkNodeVersion: () => boolean }).checkNodeVersion()).toBe(true);
  });
});
