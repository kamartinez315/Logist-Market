import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("settings")
export class Setting {
    @PrimaryColumn("varchar")
    key: string;

    @Column("int")
    businessId: number;

    @Column("varchar")
    value: string;
}
