import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

export class UserRepository {
    private repo = AppDataSource.getRepository(User);

    async findByEmail(email: string): Promise<User | null> {
        return this.repo.findOneBy({ email });
    }

    async findById(id: number): Promise<User | null> {
        return this.repo.findOneBy({ id });
    }

    async create(data: Partial<User>): Promise<User> {
        const entity = this.repo.create(data);
        return this.repo.save(entity);
    }
}
