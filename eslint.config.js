import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import globals from "globals";

export default defineConfig([
    {
        ignores: ["node_modules/", "coverage/", "dist/", "build/", "*.min.js"],
    },
    {
        files: ["**/*.js"],
        plugins: {
            js,
        },
        extends: ["js/recommended"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.jest,
            },
        },
        rules: {
            "no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "next",
                    caughtErrorsIgnorePattern: "^(err|error|_)$",
                },
            ],
        },
    },
    eslintConfigPrettier,
]);
