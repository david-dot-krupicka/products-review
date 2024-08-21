import { Request, Response } from "express";
import { ParamsDictionary } from 'express-serve-static-core';
import { Types } from 'mongoose';

export interface CreateReviewsRequest extends Request {
    body: {
        userId: string;
        productId: string;
        firstName: string;
        lastName: string;
        text: string;
        rating: number;
    }
}
/* -------------------------------------------------------------
   Base types
   ------------------------------------------------------------- */
interface ReviewIdParams extends ParamsDictionary {
    reviewId: string
}
interface ReviewIdBody {
    reviewId: string
}
/* -------------------------------------------------------------
   Request types
   ------------------------------------------------------------- */
export interface ReviewByIdParamsRequest extends Request {
    params: ReviewIdParams
}
export interface ReviewByIdBodyRequest extends Request {
    body: ReviewIdBody
}
export interface ReviewByIdRequest extends Request {
    params: ReviewIdParams
    body: ReviewIdBody
}
// -------------------------------------------------------------
export interface ReviewIdPatchBody extends ReviewIdBody {
    productId?: Types.ObjectId;
    text?: string;
    rating?: number;
    // Index signature for indexing with string type
    [key: string]: unknown;
}
export interface PatchReviewRequest extends ReviewByIdRequest {
    body: ReviewIdPatchBody
}
/* -------------------------------------------------------------
   Response types
   ------------------------------------------------------------- */
export interface ReviewLocalsResponse extends Response {
    locals: {
        productId?: string
    }
}
