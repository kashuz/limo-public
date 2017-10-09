module.exports = {
  parser: "babel-eslint",
  extends: ["airbnb-base", "prettier"],
  plugins: ["flowtype", "prettier"],
  rules: {
    "no-shadow": "off",
    "prettier/prettier": [
      "error",
      {
        singleQuote: true,
        trailingComma: "all",
      },
    ],
    "flowtype/define-flow-type": 1,
  },
};
