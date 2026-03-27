const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "commonjs",
            globals: {
                require: "readonly",
                module: "readonly",
                process: "readonly",
                __dirname: "readonly",
                console: "readonly",
                describe: "readonly",
                it: "readonly",
                expect: "readonly",
                beforeEach: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "error",
            "no-console": "error",
            "indent": ["error", 4]
        }
    }
];
