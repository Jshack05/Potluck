import js from "@eslint/js";
import ts from "typescript-eslint";
import hooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default ts.config(
  { ignores: ["dist/**", "node_modules/**", "vendor/**"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser, ...globals.vitest } },
    plugins: { "react-hooks": hooks },
    rules: { ...hooks.configs.recommended.rules },
  },
  { files: ["scripts/*.mjs"], languageOptions: { globals: globals.node } },
);
