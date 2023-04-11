import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import { uglify } from "rollup-plugin-uglify";
import less from "rollup-plugin-less";
export default [
  {
    input: "src/main.ts",
    output: {
      name: "QuillResizeModule",
      file: "dist/quill-resize-module.js",
      format: "umd",
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      less({ insert: true, output: false }),
    ],
  },
  {
    input: "src/main.ts",
    output: {
      name: "QuillResizeModule",
      file: "dist/quill-resize-module.min.js",
      format: "umd",
    },
    plugins: [
      resolve(),
      commonjs(),
      typescript(),
      uglify(),
      less({ insert: true, output: false }),
    ],
  },
];
