/* eslint-disable */
// TODO: fix eslint-disable later
import { expect } from 'chai';
import { UsersRoutesConfig } from '../../users/users.routes.config';
import express from 'express';

describe('UsersRoutesConfig', () => {
    it('should configure user routes', () => {
        const app = express();
        new UsersRoutesConfig(app);
        const routes = app._router.stack.filter((layer: any) => layer.route);
        const routePaths = routes.map((layer: any) => layer.route.path);

        expect(routePaths).to.include('/users');
        expect(routePaths).to.include('/users/:userId');
        expect(routePaths).to.include('/users/:userId/permissionFlags/:permissionFlag');
    });
});
