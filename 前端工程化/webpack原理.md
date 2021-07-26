## 总概
````html
1. webpack 内部模块机制
  webpack 基于tapable构建
  tapable 构建流程管控

2. 抽象语法树
   状态机（循环遍历字符，会用正则匹配单个字符）、正则匹配（匹配一长串）  构建AST树
       vue2 模板解析就是基于正则匹配 => vue3就是状态机了
       区别在于 正则表达式匹配时会回溯，回溯直到匹配前会一直尝试，影响性能
   代码编译流程 

3. bundle、最新bundleless原理
   tree shaking原理

打包的过程 其实就是在组织代码
gulp 基于配置项来处理要打包的资源
webpack 基于依赖 编译过程中 基于import require就知道哪些资源要处理
webpack 模块引用路径  => 依赖


模块太多会有什么问题？
1) 太多变量方法，命名、模块与模块之间存在冲突
解决冲突 需要隔离，这是webpack要做的
模块隔离就是作用域隔离 => 函数作用域隔离 => function(){} => 闭包

2) 产生了依赖之后，存在一个模块执行先后顺序的问题
   webpack 保证模型执行顺序  数组形式保证
   // b.js
   export var name = 'qgq'


   // a.js
   import { name } from 'b.js'
   function getName(){
       console.log(name) 
   }
 
   a 依赖了 b、C模块 
   b 依赖 d 模块       
   c 依赖了 e、f模块
   a 模块是入口, 其实是一个递归 深度优先遍历的过程


 1. 初始化配置
    内部默认配置 合并 用户传入的配置  => webpack config
    1). 获取用户配置  
    2). 构建默认配置
    3). 合并配置
    发布订阅比喻成打电话，电话本记录订阅，每个阶段都有自己的电话本

 2. 初始化 文件读写 分析路径 配置webpack

 webpack内部管理构建流程
 不同的阶段做 不同的事情 所以需要一个通知系统（发布订阅）

 tapable 发出通知


 总结性结论：webpack 内部就是插件，通过 tapable组织起来
 tapable会管理整个webpack的执行流程
 1. 不同的电话本，不同的处理逻辑，有同步串行的、有异步的、有并行的
 2. 不同阶段 执行不同通知
 3. 执行任务
 tap 对应 订阅过程
 call 对应 调用过程
   
 为什么tapable组织过程中，还有编译？第一遍去执行、编译出不同阶段的执行函数，第二次可以执行这些函数，提高性能 
````
## 代码编译与AST
````html
  webpack
     组织代码 
     代码编译  兼容不同的语言
         ts         => js
         sass、less => css
         es6        => es5
         代码压缩
                
   编译时 编译之前不会运行
   运行时 分配内存


var a = 1 + 2 + 3 

=> 拆解成小的token [var,a,=,1,+,2,+,3]
{
   type: 'keyword',
   value: 'var',
}
{
   type: 'identifier',
   value:'a'
}

=> 词法分析 (给token归类)

=> 语法分析（识别赋值语句、条件语句之类）构建AST树

=> 遍历AST树 修改节点

=> 重新生成兼容代码 
````
AST在线转换网址：astexplorer.net 


### tree-shaking原理
import、export静态依赖分析  
**为什么Common.js的require就不行？**  
````js
// require是动态导入的，你甚至可以在判断语句里require
let dynamicModule;
if (condition) {
  myDynamicModule = require("foo");
} else {
  myDynamicModule = require("bar");
}
// 在实际运行前, CommonJS无法确定需要或者不需要哪些模块，也就是说执行行了才知道


// import是完全静态导入的语法，意味着在判断语句里 import导入 是不可行的
if (condition) {
  myDynamicModule = import("foo");
} else {
  myDynamicModule = import("bar");
}

// 所以我们只能先在顶部声明要全部导入的哪些包，再判断用哪个
import foo from "foo";
import bar from "bar";

// 基于字面量分析，就能在代码不被运行的情况下分析出哪些模块被引用
if (condition) {
  // foo.xxxx
} else {
  // bar.xxx
}
````
从底层AST语法树的角度看，import语句的 ast node类型为 ImportDeclaration  

