import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
    {
        ignores: ["dist/**", "node_modules/**", "webpack.config.js", "index.js", "setupTests.ts", "__tests__/**", "__mocks__/**"]
    },
    {
        files: ["src/**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
                ecmaFeatures: { jsx: true }
            }
        },
        plugins: {
            "@typescript-eslint": tseslint,
            "react": reactPlugin,
            "react-hooks": reactHooksPlugin
        },
        rules: {
            // React rules
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react/display-name": "warn",

            // React Hooks rules (critical - enforce correctness)
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",

            // TypeScript rules - warn on pre-existing patterns to avoid blocking CI
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-require-imports": "off",
            "@typescript-eslint/no-unsafe-function-type": "warn",
            "@typescript-eslint/triple-slash-reference": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/no-this-alias": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/no-wrapper-object-types": "warn"
        },
        settings: {
            react: { version: "detect" }
        }
    }
];
