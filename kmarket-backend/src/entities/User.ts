import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    name: string;

    @Column("varchar", { unique: true })
    email: string;

    @Column("varchar")
    password: string;

    @Column("varchar", { default: "admin" })
    role: string;

    @Column("varchar", { nullable: true })
    avatar: string;

    @Column("int")
    businessId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
