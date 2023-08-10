import * as vitest from "vitest";
import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../eslint/check-bigint";

RuleTester.afterAll = vitest.afterAll;
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

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
