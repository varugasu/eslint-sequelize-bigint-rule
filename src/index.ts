import { Column, Model, DataType } from "sequelize-typescript";

export class User extends Model {
  @Column({ type: DataType.BIGINT })
  aBigIntColumn?: string;
}
