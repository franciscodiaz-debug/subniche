import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [".next/**", "next-env.d.ts", "out/**", "build/**"],
  },
  ...nextVitals,
];

export default eslintConfig;
