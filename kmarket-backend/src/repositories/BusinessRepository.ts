import { AppDataSource } from "../config/database";
import { Business } from "../entities/Business";

export class BusinessRepository {
    private repo = AppDataSource.getRepository(Business);

    async create(data: Partial<Business>): Promise<Business> {
        const entity = this.repo.create(data);
        return this.repo.save(entity);
    }

    async findById(id: number): Promise<Business | null> {
        return this.repo.findOneBy({ id });
    }
}
