import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "v0-reference/**",
      "design-reference/**",
      "out/**",
      "dist/**",
      "coverage/**",
    ],
  },
  ...nextVitals,
];

export default config;
