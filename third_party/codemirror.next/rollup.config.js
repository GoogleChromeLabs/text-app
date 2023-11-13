import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import dts from 'rollup-plugin-dts';

export default [{
  input: './bundle.js',
  output: {
    file: "codemirror.next.bin.js",
    format: "iife",
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    terser(),
  ],
}, {
  input: './bundle.d.ts',
  output: {
    file: './codemirror.next.bin.d.ts',
    format: 'iife',
  },
  plugins: [
    dts({ respectExternal: true }),
  ]
}];
