import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator((name) => `https://example.com/rule/${name}`);

function containsColumnDecorator(expression: TSESTree.LeftHandSideExpression): expression is TSESTree.CallExpression {
  return (
    expression.type === TSESTree.AST_NODE_TYPES.CallExpression &&
    expression.callee.type === TSESTree.AST_NODE_TYPES.Identifier &&
    expression.callee.name === "Column"
  );
}

function extendsSequelizeModel(
  sequelizeModelName: string,
  expression: TSESTree.LeftHandSideExpression | null
): expression is TSESTree.Identifier {
  return (
    expression !== null &&
    expression.type === TSESTree.AST_NODE_TYPES.Identifier &&
    expression.name === sequelizeModelName
  );
}

function containsDataTypeBigInt(obj: TSESTree.ObjectLiteralElement) {
  return (
    obj.type === TSESTree.AST_NODE_TYPES.Property &&
    obj.key.type === TSESTree.AST_NODE_TYPES.Identifier &&
    obj.key.name === "type" &&
    obj.value.type === TSESTree.AST_NODE_TYPES.MemberExpression &&
    obj.value.object.type === TSESTree.AST_NODE_TYPES.Identifier &&
    obj.value.object.name === "DataType" &&
    obj.value.property.type === TSESTree.AST_NODE_TYPES.Identifier &&
    obj.value.property.name === "BIGINT"
  );
}

module.exports = createRule({
  create(context) {
    let sequelizeModelName = "Model";
    return {
      ImportDeclaration(node) {
        if (node.source.value !== "sequelize-typescript") return;
        node.specifiers.forEach((specifier) => {
          if (specifier.type !== TSESTree.AST_NODE_TYPES.ImportSpecifier) return;
          specifier.imported.name === "Model" && (sequelizeModelName = specifier.local.name);
        });
      },
      ClassDeclaration(node) {
        if (!extendsSequelizeModel(sequelizeModelName, node.superClass)) {
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
                if (!containsDataTypeBigInt(argProperty)) return;

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
