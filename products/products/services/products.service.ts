import ProductsDao from '../dao/products.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateProductDto } from '../dto/create.product.dto';
import { PatchProductDto } from '../dto/patch.product.dto';

class ProductsService implements CRUD {
    async create(resource: CreateProductDto) {
        return ProductsDao.addProduct(resource);
    }

    async readById(id: string | number) {
        return ProductsDao.getProductById(id);
    }

    async list(limit: number, page: number) {
        return ProductsDao.getProducts(limit, page);
    }

    async patchById(id: string | number, resource: PatchProductDto) {
        return ProductsDao.updateProductById(id, resource);
    }

    async deleteById(id: string | number) {
        return ProductsDao.removeProductById(id);
    }
}

export default new ProductsService();
