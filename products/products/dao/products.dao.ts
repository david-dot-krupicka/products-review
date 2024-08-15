import { CreateProductDto } from '../dto/create.product.dto';
import { PatchProductDto } from '../dto/patch.product.dto';

import mongooseService from '../../common/services/mongoose.service';
import debug from 'debug';

const log: debug.IDebugger = debug('app:products-dao');

class ProductsDao {
    Schema = mongooseService.getMongoose().Schema;

    productSchema = new this.Schema({
        name: String,
        description: String,
        price: Number,
    });

    Product = mongooseService.getMongoose().model('Products', this.productSchema);

    constructor() {
        log('Created new instance of ProductsDao.');
    }

    async addProduct(productFields: CreateProductDto) {
        const product = new this.Product({
            ...productFields,
        });
        await product.save();
        return product._id;
    }

    async getProductById(productId: string | number) {
        return this.Product.findOne({ _id: productId }).exec();
    }

    // Pagination
    async getProducts(limit = 25, page = 0) {
        return this.Product.find()
            .limit(limit)
            .skip(limit * page)
            // TODO: Here we should have a join with reviews view
            .select('_id name')
            .exec();
    }

    async updateProductById(
        productId: string | number,
        productFields: PatchProductDto
    ) {
        return await this.Product.findOneAndUpdate(
            { _id: productId },
            { $set: productFields },
            { new: true }   // return the updated document
        ).exec();
    }

    async removeProductById(productId: string | number) {
        return this.Product.deleteOne({ _id: productId }).exec();
    }
}

export default new ProductsDao();
