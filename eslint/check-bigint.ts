import { ESLintUtils } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`
);

module.exports = createRule({
  create(context) {
    return {
      ClassDeclaration(node) {
        console.log("oiii");
        node.superClass;
      },
    };
  },
  name: "check-bigint",
  meta: {
    docs: {
      description: "",
    },
    messages: {},
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
});
