import { Request, Response } from "express";
import { ParamsDictionary } from 'express-serve-static-core';

export interface CreateUserRequest extends Request {
    body: {
        email: string,
        password: string,
        firstName?: string,
        lastName?: string,
        permissionFlags?: number
        [key: string]: any
    }
}
/* -------------------------------------------------------------
   Base types
   ------------------------------------------------------------- */
interface UserIdParams extends ParamsDictionary {
    userId?: string
    [key: string]: any
}
interface UserIdBody {
    id: string
    [key: string]: any
}
/* -------------------------------------------------------------
   Request types
   ------------------------------------------------------------- */
export interface UserByIdParamsRequest extends Request {
    params: UserIdParams
}
export interface UserByIdBodyRequest extends Request {
    body: UserIdBody
}
export interface UserByIdRequest extends Request {
    params: UserIdParams
    body: UserIdBody
}
// -------------------------------------------------------------
interface UserIdPutBody extends UserIdBody {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    permissionFlags: number
}
export interface PutUserRequest extends UserByIdRequest {
    body: UserIdPutBody
}
// -------------------------------------------------------------
interface UserIdPatchBody extends UserIdBody {
    email?: string,
    password?: string,
    firstName?: string,
    lastName?: string,
    permissionFlags?: number
}
export interface PatchUserRequest extends UserByIdRequest {
    body: UserIdPatchBody
}
// -------------------------------------------------------------
interface UserPermissionParams extends UserIdParams {
    permissionFlags?: string
}
export interface UpdatePermissionsRequest extends Request {
    params: UserPermissionParams
    body: UserIdBody
}
/* -------------------------------------------------------------
   Response types
   ------------------------------------------------------------- */
export interface UserLocalsResponse extends Response {
    locals: {
        user?: {
            _id: string,
            email: string,
            firstName: string,
            lastName: string,
            permissionFlags: number
        }
    }
}
