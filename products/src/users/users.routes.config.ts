import { CommonRoutesConfig } from "../common/common.routes.config";
import { PermissionFlag } from '../common/middleware/common.permissionflag.enum';

import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import UsersController from "./controllers/users.controller";
import UsersMiddleware from "./middleware/users.middleware";

import jwtMiddleware from '../auth/middleware/jwt.middleware';
import permissionMiddleware from '../common/middleware/common.permission.middleware';

import express from "express";
import { body } from "express-validator";
import { RequestMethod } from "./types/users.request.method";

import jwt from "jsonwebtoken";

export class UsersRoutesConfig extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, "UsersRoutesConfig");
    }

    private _commonValidationRules(requestType: RequestMethod) {
        let validationRules = [
            body('email').isEmail(),
            body('password')
                .isString()
                .isLength({ min: 10 })
                .withMessage('Must include password (10+ characters)'),
        ];

        if (requestType === 'PUT' || requestType === 'PATCH') {
            validationRules.push(body('firstName').isString());
            validationRules.push(body('lastName').isString());
            validationRules.push(body('permissionFlags').isInt());
        }

        if (requestType === 'PATCH') {
            validationRules = validationRules.map((rule) => rule.optional());
        }

        return [
            ...validationRules,
            BodyValidationMiddleware.verifyBodyFieldsErrors,
        ];
    }

    protected configureRoutes() {
        this.app
            .route(`/users`)
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired(
                    PermissionFlag.ADMIN_PERMISSION
                ),
                UsersController.listUsers
            )
            .post(
            ...this._commonValidationRules('POST'),
                UsersMiddleware.validateSameEmailDoesntExist,
                UsersController.createUser
            );

        this.app.param(`userId`, UsersMiddleware.extractUserId);
        this.app
            .route(`/users/:userId`)
            .all(
                UsersMiddleware.validateUserExists,
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.onlySameUserOrAdminCanDoThisAction
            )
            .get(UsersController.getUserById)
            .delete(UsersController.removeUser);

        this.app.put(`/users/:userId`, [
            ...this._commonValidationRules('PUT'),
            UsersMiddleware.validateSameEmailBelongToSameUser,
            UsersMiddleware.userCantChangePermission,
            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.PAID_PERMISSION
            ),
            UsersController.put,
        ]);

        this.app.patch(`/users/:userId`, [
            ...this._commonValidationRules('PATCH'),
            UsersMiddleware.validatePatchEmail,
            UsersMiddleware.userCantChangePermission,
            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.PAID_PERMISSION
            ),
            UsersController.patch,
        ]);

        this.app.put(`/users/:userId/permissionFlags/:permissionFlags`, [
            jwtMiddleware.validJWTNeeded,
            permissionMiddleware.onlySameUserOrAdminCanDoThisAction,

            // Note: The above two pieces of middleware are needed despite
            // the reference to them in the .all() call, because that only covers
            // /users/:userId, not anything beneath it in the hierarchy

            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.FREE_PERMISSION
            ),
            UsersController.updatePermissionFlags,
        ]);

        return this.app;
    }
}
