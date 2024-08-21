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
        resource: PatchReviewDto,
        productId?: string,    // TODO: Should be mongoose Types.ObjectId
    ) {
        if (productId !== undefined) {
            return ReviewsDao.updateReviewById(id, resource, productId);
        } else {
            throw new Error('productId is required');
        }
    }

    async deleteById(id: string, productId?: string) {
        if (productId !== undefined) {
            return ReviewsDao.removeReviewById(id, productId);
        } else {
            throw new Error('productId is required');
        }
    }
}

export default new ReviewsService();
