/*
 * @Author: qwh 15806293089@163.com
 * @Date: 2022-11-16 17:06:12
 * @LastEditors: qwh 15806293089@163.com
 * @LastEditTime: 2022-11-20 22:33:49
 * @FilePath: /vite2022/lib/optimizer/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const scanImports = require('./scan');
const {
    build
} = require('esbuild')
const path = require('path');
const {
    normalizePath
} = require('../utils'); //工具方法 格式化路径
const fs = require('fs-extra')
//分析项目依赖的第三方模块
async function createOptimizeDepsRun(config) {
    //扫描导入依赖模块
    //deps={ vue: 'C: /vitesOuse/node_modules/vue/dist/vue. runtime.esm-bundler.js}
    const deps = await scanImports(config)

    console.log(deps);
    //将 vue 后面对应的文件进行预打包，预编译，放到缓存目录，生成对象下的metadata返回
    //node_modules/.vite2022
    const {
        cacheDir
    } = config;
    //cacheDir触发，加上 deps node_modules/.vite2022/deps
    const depsCacheDir = path.resolve(cacheDir, 'deps')

    const metadata = { //真实文件的映射
        optimized: {}
    }
    //循环 deps。目前里面只有一个 vue 对象 id 是 vue
    for (const id in deps) {
        //拿到 vue的入口文件
        const entry = deps[id]
        // 然后将 id作为 key 存入我们上面定义 metadata.optimized对象内
        //"src"：”././vue/dist/vue.runtime.esm-bundler.js"，
        // "file"："vue. js"

        //内存里面存储的是绝对路径，写入硬盘的是相对路径
        metadata.optimized[id] = { //存储的值都是绝对路径
            file: normalizePath(path.resolve(depsCacheDir, id + '.js')),
            src: entry //是路径
        }
        //使用 esbuild开始预编译  node_modules/.vite2022/deps/vue.js 预编译后 vue 文件会被写到这 deps 下面
        //编译就是生成文件吧 是的。生成deps/vue.js 以后再访问的都是编译 好的这个文件了,好处是将多个源文件变成一个，一次请求就可以了，esbuild 编译有这个效果
        await build({
            absWorkingDir: process.cwd(), //绝对工作目录
            entryPoints: [deps[id]], //入口点
            outfile: path.resolve(depsCacheDir, id + '.js'), //输出路径
            bundle: true,
            write: true,
            format: 'esm'
        })
    }
    //写入硬盘之前保证这个目录是存在的
    await fs.ensureDir(depsCacheDir);

    //使用 node 的模块写入硬盘
    //写入文件的路径，然后将metadata写入到_metadata.json
    const metadataPath = path.join(depsCacheDir, '_metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, (key, value) => {
        if (key === 'file' || key === 'src') {
            //optimized里存的是绝对路径，此处写入硬盘的是相对于缓存目录的相对路径
            console.log(depsCacheDir, value);
            //写入的时候变成相对路径
            return normalizePath(path.relative(depsCacheDir, value));
        }
        return value
    }, 2));

    return {
        metadata
    }; //返回一个对象

}
exports.createOptimizeDepsRun = createOptimizeDepsRun