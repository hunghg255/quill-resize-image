import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import typescript from "rollup-plugin-typescript";
import { uglify } from "rollup-plugin-uglify";
import less from "rollup-plugin-less";
export default [
  {
    input: "src/main.ts",
    output: {
      name: "QuillResizeImage",
      file: "dist/quill-resize-image.js",
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
      name: "QuillResizeImage",
      file: "dist/quill-resize-image.min.js",
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
