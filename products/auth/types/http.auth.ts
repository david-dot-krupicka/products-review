import { Request, Response } from "express";

export interface UserRegistration extends Request {
    body: {
        userId?: string,
        email: string,
        password?: string | Buffer,
        firstName?: string,
        lastName?: string,
        permissionFlags?: number
    }
}
export interface JwtLocalsResponse extends Response {
    locals: {
        jwt?: {
            refreshKey: Buffer;
            userId: string;
            permissionFlags: string;
        }
    }
}