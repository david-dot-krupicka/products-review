import express from 'express';
import * as httpAuth from '../../auth/types/http.auth';
import { PermissionFlag } from './common.permissionflag.enum';
import { UserByIdRequest, UpdatePermissionsRequest } from '../../users/types/http.users';
import debug from 'debug';

const log: debug.IDebugger = debug('app:common-permission-middleware');

class CommonPermissionMiddleware {
    permissionFlagRequired(requiredPermissionFlag: PermissionFlag) {
        return (
            req: express.Request,
            res: httpAuth.JwtLocalsResponse,
            next: express.NextFunction
        ) => {
            try {
                if (res.locals.jwt !== undefined) {
                    const userPermissionFlags = parseInt(
                        res.locals.jwt.permissionFlags
                    );
                    if (userPermissionFlags & requiredPermissionFlag) {
                        next();
                    } else {
                        res.status(403).send();
                    }
                } else {
                    res.status(401).send();
                }
            } catch (err) {
                log(err);
            }
        };
    }

    onlySameUserOrAdminCanDoThisAction = (
        req: UserByIdRequest | UpdatePermissionsRequest,
        res: httpAuth.JwtLocalsResponse,
        next: express.NextFunction
    ) => {
        if (res.locals.jwt !== undefined) {
            const userPermissionFlags = parseInt(res.locals.jwt.permissionFlags);
            if (req.params.userId === res.locals.jwt.userId) {
                next();
            } else {
                if (userPermissionFlags & PermissionFlag.ADMIN_PERMISSION) {
                    log('calling next');
                    next();
                } else {
                    log('sending 403')
                    res.status(403).send();
                }
            }
        } else {
            res.status(401).send();
        }
    }
}

export default new CommonPermissionMiddleware();
