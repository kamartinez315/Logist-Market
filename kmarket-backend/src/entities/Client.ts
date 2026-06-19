import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("clients")
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    name: string;

    @Column("varchar", { nullable: true })
    email: string;

    @Column("varchar", { nullable: true })
    phone: string;

    @Column("varchar", { nullable: true })
    address: string;

    @Column("text", { nullable: true })
    notes: string;

    @Column("varchar", { default: "active" })
    status: string;

    @Column("varchar", { nullable: true })
    avatarColor: string;

    @Column("varchar", { nullable: true })
    joinDate: string;

    @Column("varchar", { nullable: true })
    lastVisit: string;

    @Column("int")
    businessId: number;

    @Column("int", { default: 0 })
    totalPurchases: number;

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    totalSpent: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
