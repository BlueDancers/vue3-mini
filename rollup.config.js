import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

/**
 * 默认导出一个数组,数组中,每个对象都是独立导出项
 */
export default [
  {
    input: 'packages/vue/src/index.ts',
    output: [
      // 导出iife的包(自动执行 适用于script标签)
      {
        format: 'iife',
        sourcemap: true,
        file: './packages/vue/dist/vue.js',
        name: 'Vue', // 指定打包后的全局变量名
      },
    ],
    // 插件
    plugins: [
      // 让rollup 支持打包ts代码,并可以指定ts代码打包过程中的相关配置
      typescript({
        sourceMap: true,
      }),
      // 与webpack不同的是,rollup并不知道如何寻找路径以外的依赖,比如node_module中的
      // 帮助程序可以在项目依赖中找到对应文件
      resolve(),
      // rollup默认仅支持es6的模块,但是还存在很多基于commonjs的npm模块,这就需要改插件来完成读取工作
      commonjs(),
    ],
  },
]
