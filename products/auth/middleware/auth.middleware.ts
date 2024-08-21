import express from 'express';
import * as argon2 from 'argon2';
import * as httpAuth from '../types/http.auth';
import usersService from '../../users/services/users.service';

class AuthMiddleware {
    verifyUserPassword = async (
        //req: httpAuth.UserRegistration,
        req: httpAuth.UserRegistration,
        res: express.Response,
        next: express.NextFunction
    )=> {

        const user = await usersService.getUserByEmailWithPassword(
            req.body.email
        );

        if (user && user._id && user.email && user.password && user.permissionFlags) {
            const passwordHash = user.password;
            if (req.body.password && await argon2.verify(passwordHash, req.body.password)) {
                req.body = {
                    userId: user._id,
                    email: user.email,
                    permissionFlags: user.permissionFlags,
                }
                next();
                return;
            }
        }
        res.status(400).send({errors: ['Invalid email and/or password']});
    }
}

export default new AuthMiddleware();
