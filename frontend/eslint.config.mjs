import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...nextCoreWebVitals,
  {
    ignores: [".next/**", "next-env.d.ts"],
    rules: {
  "react-hooks/set-state-in-effect": "off",
}
  },
];

export default eslintConfig;
