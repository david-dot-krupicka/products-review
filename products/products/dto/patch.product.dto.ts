export interface PatchProductDto {
    _id: number;
    name?: string;
    description?: string;
    price?: number;
    // No list of reviews here
}