import express from 'express';
import * as httpUsers from '../types/http.users';
import userService from '../services/users.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:users-controller');

class UsersMiddleware {
    validateSameEmailDoesntExist = async (
        req: httpUsers.CreateUserRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        await userService.getUserByEmail(req.body.email).then((result) => {
            if (result) {
                res.status(400).send({error: `User email already exists`});
            } else {
                next();
            }
        }).catch((error: unknown) => {
            next(error);
        })
    }

    validateSameEmailBelongToSameUser = (
        req: httpUsers.PutUserRequest | httpUsers.PatchUserRequest,
        res: httpUsers.UserLocalsResponse,
        next: express.NextFunction
    ) => {
        if (res.locals.user && res.locals.user._id === req.params.userId) {
            next();
        } else {
            res.status(400).send({ error: `Invalid email` });
        }
    }

    // Here we need to use an arrow function to bind `this` correctly
    validatePatchEmail = (
        req: httpUsers.PutUserRequest | httpUsers.PatchUserRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        if (req.body.email) {
            log('Validating email', req.body.email);

            this.validateSameEmailBelongToSameUser(req, res, next);
        } else {
            next();
        }
    };

    validateUserExists = async (
        req: httpUsers.UserByIdParamsRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const user = await userService.readById(req.params.userId);
        if (user) {
            res.locals.user = user;
            next();
        } else {
            res.status(404).send({
                error: `User ${req.params.userId} not found`,
            });
        }
    }

    // Put userId into the request body
    extractUserId = (
        req: httpUsers.UserByIdBodyRequest,
        res: express.Response,
        next: express.NextFunction
    ) => {
        req.body.id = req.params.userId;
        next();
    }

    userCantChangePermission = (
        req: httpUsers.PutUserRequest | httpUsers.PatchUserRequest,
        res: httpUsers.UserLocalsResponse,
        next: express.NextFunction
    ) => {
        if (
            'permissionFlags' in req.body &&
            res.locals.user !== undefined &&
            req.body.permissionFlags !== res.locals.user.permissionFlags
        ) {
            res.status(400).send({
                errors: ['User cannot change permission flags'],
            })
        } else {
            next();
        }
    }
}

export default new UsersMiddleware();
