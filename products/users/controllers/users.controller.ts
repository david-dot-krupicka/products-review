import { PatchUserDto } from '../dto/patch.user.dto';
import * as httpUsers from '../types/http.users';
import express from 'express';
import usersService from '../services/users.service';

// we import the argon2 library for password hashing
import argon2 from 'argon2';

// we use debug with a custom context as described in Part 1
import debug from 'debug';

const log: debug.IDebugger = debug('app:users-controller');

class UsersController {
    listUsers = async (req: express.Request, res: express.Response) => {
        const users = await usersService.list(100, 0);
        res.status(200).send(users);
    }

    getUserById = async (req: httpUsers.UserByIdRequest, res: express.Response) => {
        const user = await usersService.readById(req.body.id);
        log("Fetched user");
        log(user);
        res.status(200).send(user);
    }

    createUser = async (req: httpUsers.CreateUserRequest, res: express.Response) => {
        req.body.password = await argon2.hash(req.body.password);
        const userId = await usersService.create(req.body);
        res.status(201).send({ id: userId });
    }

    patch = async (req: httpUsers.PatchUserRequest, res: express.Response) => {
        if (req.body.password) {
            req.body.password = await argon2.hash(req.body.password);
        }
        log(await usersService.patchById(req.body.id, req.body));
        res.status(204).send();
    }

    put = async (req: httpUsers.PutUserRequest, res: express.Response) => {
        req.body.password = await argon2.hash(req.body.password);
        log(await usersService.putById(req.body.id, req.body));
        res.status(204).send();
    }

    removeUser = async (req: httpUsers.UserByIdRequest, res: express.Response) => {
        log(await usersService.deleteById(req.body.id));
        res.status(204).send();
    }

    updatePermissionFlags = async (req: httpUsers.UpdatePermissionsRequest, res: express.Response) => {
        const permissionFlags = req.params.permissionFlags;
        const patchUserDto: PatchUserDto = {
            permissionFlags: parseInt(permissionFlags),
        };
        log(await usersService.patchById(req.body.id, patchUserDto));
        res.status(204).send();
    }
}

export default new UsersController();
