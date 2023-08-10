import * as mocha from "mocha";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../eslint/check-bigint";

RuleTester.afterAll = mocha.after;

const ruleTest = new RuleTester();

ruleTest.run("check-bigint", rule, {
  valid: [
    `
  import { Column, Model as SequelizeModel, DataType } from "sequelize-typescript";

  export class User extends SequelizeModel {
    @Column({ type: DataType.BIGINT })
    aBigIntColumn?: bigint;
  }`,
    `
  import { Column, Model } from "sequelize-typescript";

  export class User extends Model {
    @Column
    aBigIntColumn?: int;
  }`,
  ],
  invalid: [
    {
      code: `
      import { Column, Model as SequelizeModel, DataType } from "sequelize-typescript";
    
      export class User extends SequelizeModel {
        @Column({ type: DataType.BIGINT })
        aBigIntColumn?: number;
      }`,
      errors: [{ messageId: "useBigInt" }],
      output: `
      import { Column, Model as SequelizeModel, DataType } from "sequelize-typescript";
    
      export class User extends SequelizeModel {
        @Column({ type: DataType.BIGINT })
        aBigIntColumn?: bigint;
      }`,
    },
  ],
});
