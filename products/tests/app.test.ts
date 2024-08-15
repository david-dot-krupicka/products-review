import mongoose from 'mongoose';
import { expect } from 'chai';
import request from 'supertest';
import { app, server } from '../app';

describe('App Initialization', () => {
    it('should return 200 on GET /', (done) => {
        request(server)
            .get('/')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.text).to.equal('Server running at http://localhost:8080');
                done();
            });
    });

    it('should configure routes', () => {
        const routes = app._router.stack.filter((layer: any) => layer.route);
        const routePaths = routes.map((layer: any) => layer.route.path);
        expect(routePaths).to.include('/');
        expect(routePaths).to.include('/users');
        expect(routePaths).to.include('/users/:userId');
        expect(routePaths).to.include('/users/:userId/permissionFlags/:permissionFlags');
        expect(routePaths).to.include('/auth');
        expect(routePaths).to.include('/auth/refresh-token');
    });

    // TODO: Other end to end tests

    after((done) => {
        server.close(done);
    });
});
