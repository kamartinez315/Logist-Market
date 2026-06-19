import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("expenses")
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    description: string;

    @Column("decimal", { precision: 10, scale: 2 })
    amount: number;

    @Column("date", { default: () => "CURRENT_DATE" })
    date: Date;

    @Column("int")
    businessId: number;

    @Column("text", { nullable: true })
    notes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
