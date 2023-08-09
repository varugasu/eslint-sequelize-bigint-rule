import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`
);

module.exports = createRule({
  create(context) {
    let modelNode: TSESTree.Identifier;
    return {
      ClassDeclaration(node) {
        if (node.superClass?.type === TSESTree.AST_NODE_TYPES.Identifier) {
          if (node.superClass.name === "Model") {
            modelNode = node.superClass;
          }
        }
        if (!modelNode) return;

        node.body.body.forEach((property) => {
          if (property.type !== TSESTree.AST_NODE_TYPES.PropertyDefinition)
            return;
          property.decorators?.forEach((decorator) => {
            if (
              decorator.expression.type !==
              TSESTree.AST_NODE_TYPES.CallExpression
            )
              return;

            if (
              decorator.expression.callee.type !==
              TSESTree.AST_NODE_TYPES.Identifier
            )
              return;

            if (decorator.expression.callee.name !== "Column") return;

            decorator.expression.arguments.forEach((argument) => {
              if (argument.type !== TSESTree.AST_NODE_TYPES.ObjectExpression)
                return;

              argument.properties.forEach((argProperty) => {
                if (argProperty.type !== TSESTree.AST_NODE_TYPES.Property)
                  return;

                if (argProperty.key.type !== TSESTree.AST_NODE_TYPES.Identifier)
                  return;

                if (argProperty.key.name !== "type") return;

                if (
                  argProperty.value.type !==
                  TSESTree.AST_NODE_TYPES.MemberExpression
                )
                  return;

                if (
                  argProperty.value.object.type !==
                  TSESTree.AST_NODE_TYPES.Identifier
                )
                  return;

                if (argProperty.value.object.name !== "DataType") return;
                if (
                  argProperty.value.property.type !==
                  TSESTree.AST_NODE_TYPES.Identifier
                )
                  return;

                if (argProperty.value.property.name !== "BIGINT") return;

                if (
                  property.typeAnnotation?.typeAnnotation.type !==
                  TSESTree.AST_NODE_TYPES.TSBigIntKeyword
                ) {
                  context.report({
                    node: property.key,
                    messageId: "useBigInt",
                  });
                }
              });
            });
          });
        });
      },
    };
  },
  name: "check-bigint",
  meta: {
    docs: {
      description: "",
    },
    messages: {
      useBigInt: "Use bigint instead of number for BigInt column",
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
});
