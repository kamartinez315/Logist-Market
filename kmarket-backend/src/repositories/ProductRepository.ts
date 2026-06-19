import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";

export class ProductRepository {
    private repo = AppDataSource.getRepository(Product);

    async findAll(businessId: number) {
        return this.repo.find({ where: { businessId } });
    }

    async findById(id: number, businessId: number) {
        return this.repo.findOneBy({ id, businessId });
    }

    async create(data: Partial<Product>) {
        const product = this.repo.create(data);
        return this.repo.save(product);
    }

    async update(id: number, data: Partial<Product>, businessId: number) {
        await this.repo.update({ id, businessId }, data);
        return this.findById(id, businessId);
    }

    async delete(id: number, businessId: number) {
        await this.repo.delete({ id, businessId });
    }
}
