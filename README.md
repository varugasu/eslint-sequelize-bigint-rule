# Typescript-ESLint Custom Rules POC

## Using Local Rules

ESLint allows to include custom rules by adding them in the `plugins` configuration, then referencing the rules in `rules`.

Because of it, we would need to distribute custom rules as NPM packages. In Monorepo, this works great due to Workspaces. But we have a problem in small codebases.

The following projects cover this later case:
* https://github.com/not-an-aardvark/eslint-plugin-rulesdir
* https://github.com/taskworld/eslint-plugin-local
* https://github.com/cletusw/eslint-plugin-local-rules

From all of them, `rulesdir` provided the best DX by being plug-n-play. Therefore, this POC uses `rulesdir`.

### Transpiling

ESLint can only run a rule if it is a **Javascript file**. Therefore, we must transpile all rules before using them.

This can be done in two ways:

* **Pre-transpiling**
* **Transpiling on the fly**

#### Pre-transpiling

This method works by running `tsc` and pointing `rulesdir` to the `dist` folder

```js
const rulesDirPlugin = require("eslint-plugin-rulesdir");
rulesDirPlugin.RULES_DIR = "dist/eslint/";
```

During development, we must use `tsc -w` for detecting changes. However, **this is not a problem for Monorepos**.

Also, **this provides better perfomance**.

#### Transpiling on the fly

Although, pre-transpiling is not a problem at all, we can use a **loader in the eslint config file** to transpile rules on the fly.

This can be done with:
* `ts-loader`
* `@babel/node`
* `tsx` (`@esbuild-kit/cjs-loader`)

By placing:
* `require('ts-loader/register')`, or
* `require("@esbuild-kit/cjs-loader")`

At the top of the `.eslintrc.cjs`, the rules will be transpiled on the fly. This way, we can se our `rulesdir` to:

```js
require("@esbuild-kit/cjs-loader");

const rulesDirPlugin = require("eslint-plugin-rulesdir");
rulesDirPlugin.RULES_DIR = "eslint/";
```
