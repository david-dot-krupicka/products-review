import UsersDao from '../dao/users.dao';
import { CRUD } from '../../common/interfaces/crud.interface';
import { CreateUserDto } from '../dto/create.user.dto';
import { PutUserDto } from '../dto/put.user.dto';
import { PatchUserDto } from '../dto/patch.user.dto';

class UsersService implements CRUD {
    async create(resource: CreateUserDto) {
        return UsersDao.addUser(resource);
    }

    async readById(id: string | number) {
        return UsersDao.getUserById(id);
    }

    async getUserByEmail(email: string) {
        return UsersDao.getUserByEmail(email);
    }

    async getUserByEmailWithPassword(email: string) {
        return UsersDao.getUserByEmailWithPassword(email);
    }

    async list(limit: number, page: number) {
        return UsersDao.getUsers(limit, page);
    }

    async patchById(id: string | number, resource: PatchUserDto) {
        return UsersDao.updateUserById(id, resource);
    }

    async putById(id: string | number, resource: PutUserDto) {
        return UsersDao.updateUserById(id, resource);
    }

    async deleteById(id: string | number) {
        return UsersDao.removeUserById(id);
    }
}

export default new UsersService();
