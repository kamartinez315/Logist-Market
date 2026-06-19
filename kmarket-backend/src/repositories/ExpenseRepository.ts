import { AppDataSource } from "../config/database";
import { Expense } from "../entities/Expense";

export class ExpenseRepository {
    private repo = AppDataSource.getRepository(Expense);

    async findAll(businessId: number) {
        return this.repo.find({ where: { businessId }, order: { date: "DESC" } });
    }

    async findById(id: number, businessId: number) {
        return this.repo.findOneBy({ id, businessId });
    }

    async create(data: Partial<Expense>) {
        const expense = this.repo.create(data);
        return this.repo.save(expense);
    }

    async update(id: number, data: Partial<Expense>, businessId: number) {
        await this.repo.update({ id, businessId }, data);
        return this.findById(id, businessId);
    }

    async delete(id: number, businessId: number) {
        await this.repo.delete({ id, businessId });
    }
}
