import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("registration_logs")
export class RegistrationLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("varchar")
    userName: string;

    @Column("varchar")
    userEmail: string;

    @Column("varchar")
    businessName: string;

    @Column("varchar", { default: "owner" })
    role: string;

    @CreateDateColumn()
    registeredAt: Date;
}
