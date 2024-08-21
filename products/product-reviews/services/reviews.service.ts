import ReviewsDao from '../dao/reviews.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateReviewDto } from '../dto/create.review.dto';
import { PatchReviewDto } from '../dto/patch.review.dto';

class ReviewsService implements CRUD {
    async create(resource: CreateReviewDto) {
        return ReviewsDao.addReview(resource);
    }

    async list(limit: number, page: number, id: string | undefined) {
        return ReviewsDao.listReviews(limit, page, id);
    }

    async readById(id: string) {
        return ReviewsDao.getReviewById(id);
    }

    async readByUserIdProductId(id: string, productId: string ) {
        return ReviewsDao.getReviewByUserIdProductId(id, productId);
    }

    async patchById(
        id: string,
        resource: PatchReviewDto
    ) {
        return ReviewsDao.updateReviewById(id, resource);
    }

    async deleteById(id: string) {
        return ReviewsDao.removeReviewById(id);
    }
}

export default new ReviewsService();
