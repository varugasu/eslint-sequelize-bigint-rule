import { RuleTester } from "@typescript-eslint/rule-tester";
import rule from "../eslint/check-bigint";

const ruleTest = new RuleTester();

ruleTest.run("check-bigint", rule, {
  valid: [`class A {}`],
  invalid: [],
});
