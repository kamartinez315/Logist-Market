import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("businesses")
export class Business {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    name: string;

    @CreateDateColumn()
    createdAt: Date;
}
