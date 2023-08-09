import { Column, Model as SequelizeModel, DataType } from "sequelize-typescript";

export class User extends SequelizeModel {
  @Column({ type: DataType.BIGINT })
  aBigIntColumn?: string;
}
