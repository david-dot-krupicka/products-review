export interface JobDataDefinition {
    collectionName: string;
    productIdFieldName: string;
    ratingFieldName: string;
}
export interface JobData {
    definition: JobDataDefinition;
    productId: string;
}
export interface JobResult {
    _id: string;
    avgRating: number;
    avgRatingRounded: number;
}
