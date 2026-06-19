import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("products")
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    name: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    cost: number;

    @Column("int", { default: 0 })
    stock: number;

    @Column("varchar", { nullable: true })
    category: string;

    @Column("int")
    businessId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
