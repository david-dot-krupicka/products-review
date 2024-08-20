/* eslint-disable */
// TODO: fix eslint-disable later
import { expect } from 'chai';
import { AuthRoutesConfig } from '../../auth/auth.routes.config';
import express from 'express';

describe('AuthRoutesConfig', () => {
    it('should configure auth routes', () => {
        const app = express();
        const authRoutes = new AuthRoutesConfig(app);
        const routes = app._router.stack.filter((layer: any) => layer.route);
        const routePaths = routes.map((layer: any) => layer.route.path);
        expect(routePaths).to.include('/auth');
        expect(routePaths).to.include('/auth/refresh-token');
    });
});
