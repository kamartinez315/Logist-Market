import { AppDataSource } from "../config/database";
import { Client } from "../entities/Client";

export class ClientRepository {
    private repo = AppDataSource.getRepository(Client);

    async findAll(businessId: number) {
        return this.repo.find({ where: { businessId } });
    }

    async findById(id: number, businessId: number) {
        return this.repo.findOneBy({ id, businessId });
    }

    async create(data: Partial<Client>) {
        const client = this.repo.create(data);
        return this.repo.save(client);
    }

    async update(id: number, data: Partial<Client>, businessId: number) {
        await this.repo.update({ id, businessId }, data);
        return this.findById(id, businessId);
    }

    async delete(id: number, businessId: number) {
        await this.repo.delete({ id, businessId });
    }
}
