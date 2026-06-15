"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_manager_1 = require("../environment-manager");
describe('EnvironmentManager', () => {
    it('accepts the current Node.js major version', () => {
        const manager = new environment_manager_1.EnvironmentManager({});
        expect(manager.checkNodeVersion()).toBe(true);
    });
});
//# sourceMappingURL=environment-manager.test.js.map