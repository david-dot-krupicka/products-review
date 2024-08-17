export interface CreateReviewDto {
    userId: string;
    productId: string;
    firstName: string;
    lastName: string;
    text: string;
    rating: number;
}