import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("inventory_movements")
export class InventoryMovement {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    businessId: number;

    @Column("int")
    productId: number;

    @Column("varchar")
    type: "IN" | "OUT";

    @Column("int")
    quantity: number;

    @Column("varchar", { nullable: true })
    reason: string;

    @CreateDateColumn()
    createdAt: Date;
}
