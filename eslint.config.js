import pluginVue from "eslint-plugin-vue";
import tsEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "src-tauri/**"],
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsEslint,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  ...pluginVue.configs["flat/essential"],
  {
    files: ["src/**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
      },
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-unused-vars": "warn",
    },
  },
];
