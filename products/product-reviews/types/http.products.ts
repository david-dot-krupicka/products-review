import { Request } from "express";
import { ParamsDictionary } from 'express-serve-static-core';

export interface CreateProductRequest extends Request {
    body: {
        name: string,
        description: string,
        price: number
    }
}
/* -------------------------------------------------------------
   Base types
   ------------------------------------------------------------- */
interface ProductIdParams extends ParamsDictionary {
    productId: string
}
interface ProductIdBody {
    productId: string
}
/* -------------------------------------------------------------
   Request types
   ------------------------------------------------------------- */
export interface ProductByIdParamsRequest extends Request {
    params: ProductIdParams
}
export interface ProductByIdBodyRequest extends Request {
    body: ProductIdBody
}
export interface ProductByIdRequest extends Request {
    params: ProductIdParams
    body: ProductIdBody
}
// -------------------------------------------------------------
interface ProductIdPatchBody extends ProductIdBody {
    name?: string,
    description?: string,
    price?: number,
}
export interface PatchProductRequest extends ProductByIdRequest {
    body: ProductIdPatchBody
}
