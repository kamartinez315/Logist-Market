import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("sale_details")
export class SaleDetail {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    saleId: number;

    @Column("int")
    businessId: number;

    @Column("int")
    productId: number;

    @Column("int")
    quantity: number;

    @Column("decimal", { precision: 10, scale: 2 })
    unitPrice: number;

    @Column("decimal", { precision: 10, scale: 2 })
    subtotal: number;

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    unitCost: number;
}
