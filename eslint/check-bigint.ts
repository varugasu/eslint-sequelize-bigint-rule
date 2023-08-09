import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://example.com/rule/${name}`);

function containsColumnDecorator(expression: TSESTree.LeftHandSideExpression): expression is TSESTree.CallExpression {
  return (
    expression.type === TSESTree.AST_NODE_TYPES.CallExpression &&
    expression.callee.type === TSESTree.AST_NODE_TYPES.Identifier &&
    expression.callee.name === "Column"
  );
}

function extendsSequelizeModel(expression: TSESTree.LeftHandSideExpression | null): expression is TSESTree.Identifier {
  return expression !== null && expression.type === TSESTree.AST_NODE_TYPES.Identifier && expression.name === "Model";
}

module.exports = createRule({
  create(context) {
    return {
      ClassDeclaration(node) {
        if (!extendsSequelizeModel(node.superClass)) {
          return;
        }

        node.body.body.forEach((property) => {
          if (property.type !== TSESTree.AST_NODE_TYPES.PropertyDefinition) return;
          property.decorators?.forEach((decorator) => {
            if (!containsColumnDecorator(decorator.expression)) return;

            decorator.expression.arguments.forEach((argument) => {
              if (argument.type !== TSESTree.AST_NODE_TYPES.ObjectExpression) return;

              argument.properties.forEach((argProperty) => {
                // Ensures Column has an argument with "type: DataType.BIGINT"
                if (
                  !(
                    argProperty.type === TSESTree.AST_NODE_TYPES.Property &&
                    argProperty.key.type === TSESTree.AST_NODE_TYPES.Identifier &&
                    argProperty.key.name === "type" &&
                    argProperty.value.type === TSESTree.AST_NODE_TYPES.MemberExpression &&
                    argProperty.value.object.type === TSESTree.AST_NODE_TYPES.Identifier &&
                    argProperty.value.object.name === "DataType" &&
                    argProperty.value.property.type === TSESTree.AST_NODE_TYPES.Identifier &&
                    argProperty.value.property.name === "BIGINT"
                  )
                )
                  return;

                if (property.typeAnnotation?.typeAnnotation.type !== TSESTree.AST_NODE_TYPES.TSBigIntKeyword) {
                  context.report({
                    node: property.key,
                    messageId: "useBigInt",
                    fix: (fixer) => {
                      if (!property.typeAnnotation?.typeAnnotation) return null;
                      return fixer.replaceTextRange(property.typeAnnotation?.typeAnnotation.range, "bigint");
                    },
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
    fixable: "code",
  },
  defaultOptions: [],
});
