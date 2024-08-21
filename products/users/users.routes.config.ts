import { CommonRoutesConfig } from "../common/common.routes.config";
import { PermissionFlag } from '../common/middleware/common.permissionflag.enum';

import BodyValidationMiddleware from "../common/middleware/body.validation.middleware";
import UsersController from "./controllers/users.controller";
import UsersMiddleware from "./middleware/users.middleware";

import jwtMiddleware from '../auth/middleware/jwt.middleware';
import permissionMiddleware from '../common/middleware/common.permission.middleware';

import express from "express";
import asyncHandler from "express-async-handler";
import { body } from "express-validator";

export class UsersRoutesConfig extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, "UsersRoutesConfig");
    }

    protected configureRoutes() {
        this.app
            .route(`/users`)
            .get(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.permissionFlagRequired(
                    PermissionFlag.ADMIN_PERMISSION
                ),
                asyncHandler(UsersController.listUsers)
            )
            .post(
                body('email').isEmail(),
                body('password')
                    .isString()
                    .isLength({ min: 10 })
                    .withMessage('Must include password (10+ characters)'),
                BodyValidationMiddleware.verifyBodyFieldsErrors,
                asyncHandler(UsersMiddleware.validateSameEmailDoesntExist),
                asyncHandler(UsersController.createUser)
            );

        this.app.param(`userId`, UsersMiddleware.extractUserId);
        this.app
            .route(`/users/:userId`)
            .all(
                asyncHandler(UsersMiddleware.validateUserExists),
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.onlySameUserOrAdminCanDoThisAction
            )
            .get(asyncHandler(
                UsersController.getUserById))
            .delete(asyncHandler(
                UsersController.removeUser));

        this.app.put(`/users/:userId`, [
            body('email').isEmail(),
            body('password')
                .isString()
                .isLength({ min: 10 })
                .withMessage('Must include password (10+ characters)'),
            body('firstName').isString(),
            body('lastName').isString(),
            body('permissionFlags').isInt(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            UsersMiddleware.validateSameEmailBelongToSameUser,
            UsersMiddleware.userCantChangePermission,
            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.PAID_PERMISSION
            ),
            UsersController.put,
        ]);

        this.app.patch(`/users/:userId`, [
            body('email').isEmail().optional(),
            body('password')
                .isString()
                .isLength({ min: 10 })
                .withMessage('Must include password (10+ characters)')
                .optional(),
            body('firstName').isString().optional(),
            body('lastName').isString().optional(),
            body('permissionFlags').isInt().optional(),
            BodyValidationMiddleware.verifyBodyFieldsErrors,
            UsersMiddleware.validatePatchEmail,
            UsersMiddleware.userCantChangePermission,
            permissionMiddleware.permissionFlagRequired(
                PermissionFlag.PAID_PERMISSION
            ),
            UsersController.patch,
        ]);

        this.app
            .route(`/users/:userId/permissionFlags/:permissionFlag`)
            .put(
                jwtMiddleware.validJWTNeeded,
                permissionMiddleware.onlySameUserOrAdminCanDoThisAction,

                // Note: The above two pieces of middleware are needed despite
                // the reference to them in the .all() call, because that only covers
                // /users/:userId, not anything beneath it in the hierarchy

                permissionMiddleware.permissionFlagRequired(
                    PermissionFlag.ANOTHER_PAID_PERMISSION
                ),
                asyncHandler(UsersController.updatePermissionFlags),
            );

        return this.app;
    }
}
