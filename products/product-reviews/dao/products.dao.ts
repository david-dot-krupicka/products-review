import { CreateProductDto } from '../dto/create.product.dto';
import { PatchProductDto } from '../dto/patch.product.dto';
import { JobResult } from '../../common/types/jobdata';

import bullmqService from "../../common/services/bullmq.service";
import mongooseService from '../../common/services/mongoose.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:products-dao');

class ProductsDao {
    Schema = mongooseService.getMongoose().Schema;

    productSchema = new this.Schema({
        name: { type: String, unique: true },
        description: String,
        price: Number,
        averageRating: Number,
    });

    Product = mongooseService.getMongoose().model('Products', this.productSchema);

    constructor() {
        log('Created new instance of ProductsDao.');

        bullmqService.on('jobCompleted', (jobResult: JobResult) => {
            try {
                this.updateProductById(jobResult._id,
                    {averageRating: jobResult.avgRatingRounded}
                ).then(r => log('Updated product: ', r));
            } catch (error) {
                log('Error updating product with average rating: ', error);
            }
        });
    }

    async addProduct(productFields: CreateProductDto) {
        try {
            const product = new this.Product({
                ...productFields,
            });

            await product.save();
            return product._id;
        } catch (error) {
            log('Error saving product: ', error);
            throw error;
        }
    }

    async getProductById(productId: string | number) {
        try {
            return this.Product.findOne({_id: productId})
                .select('_id name description price')
                .exec();
        } catch (error) {
            log('Error getting product by id: ', error);
            throw error;
        }
    }

    async getProductByName(productName: string) {
        try {
            return this.Product.findOne({name: productName}).exec();
        } catch (error) {
            log('Error getting product by name: ', error);
            throw error;
        }
    }

    // Pagination
    async getProducts(limit = 25, page = 0) {
        try {
            return this.Product.find()
                .limit(limit)
                .skip(limit * page)
                // TODO: Here we could have a join with reviews collection
                .select('_id name')
                .exec();
        } catch (error) {
            log('Error getting products: ', error);
            throw error;
        }
    }

    async updateProductById(
        productId: string | number,
        productFields: PatchProductDto
    ) {
        try {
            return await this.Product.findOneAndUpdate(
                {_id: productId},
                {$set: productFields},
                {new: true}   // return the updated document
            ).exec();
        } catch (error) {
            log('Error updating product by id: ', error);
            throw error;
        }
    }

    async removeProductById(productId: string | number) {
        try {
            return this.Product.deleteOne({_id: productId}).exec();
        } catch (error) {
            log('Error removing product by id: ', error);
            throw error;
        }
    }
}

export default new ProductsDao();
