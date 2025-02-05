import resolve from "@rollup/plugin-node-resolve";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import babel from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import postcss from "rollup-plugin-postcss";
import terser from "@rollup/plugin-terser";

// rollup.config.mjs
export default {
  input: "src/main.ts",
  output: [
    {
      file: "dist/bundle.js",
      format: "cjs",
    },
    {
      file: "dist/bundle.es.js",
      format: "es",
      exports: "named",
    },
  ],
  plugins: [
    postcss({
      plugins: [],
      minimize: true,
    }),
    resolve({
      extensions: [".js", ".ts", ".tsx", ".jsx"],
    }),
    peerDepsExternal(),
    babel({
      babelHelpers: "bundled",
      exclude: ["node_modules/**"],
    }),
    typescript({
      exclude: ["node_modules/**", "src/stories/**"],
    }),
    terser(),
  ],
};
