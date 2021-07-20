
/**
 * 当前应用只定义转换表达式的处理，转换AST
 * 实现let兼容到var关键字的过程，其他情况，可以使用其他对应的语法规则
 * https://github.com/antlr/grammars-v4/tree/master/javascript
 * 1. 词法分析
 * 2. 语法分析
 * 3. 构建AST树
 * 4. 遍历树节点
 * 5. 转换
 * 6. 生成新代码
 */

/* 解析代码 返回tokens*/
function tokenizer(input) {
     
    var current = 0; // 当前输入语句被解析到哪一个字符的位置
    var tokens  = []; // 保存所有token

    while(current < input.length){
        var char = input[current] // 获取当前的字符

        //定义符号的表达式，匹配单个字符，不会回溯
        // 正则表达式 /i/ 忽略字符大小写
        // /m/ 多行匹配 默认状态下，一个字符串无论是否换行只有一个开始^和结尾$，如果采用多行匹配，那么每一个行都有一个^和结尾$
        var PUNCTUATOR = /[`~!@#$%^&*()_\-+=<>?:"{}|,.\/;'\\[\]·~！@#￥%……&*（）——\-+={}|《》？：“”【】、；‘’，。、]/im 
        
        // punctuator 标点符号
        if (PUNCTUATOR.test(char)) {
            //内部处理了= 与=>的情况
            //创建变量保存符号
            var punctuators = char;

            //判断 => 箭头函数的情况
            if (char === '=' && input[current + 1] === '>') {
                punctuators += input[current + 1];
            }
            current++;

            tokens.push({
                type: 'Punctuator',
                value: punctuators
            });

            // 进入下一次循环 后面语句不执行了
            continue;
        }

        // 处理空格的情况，如果是空格，不做token处理， 直接进入到下一个循环
        var WHITE_SPACE = /\s/
        if (WHITE_SPACE.test(char)) {
            current++;
            continue;
        }

        //处理数字的情况
        var NUMBER = /[0-9]/
        if (NUMBER.test(char)) {
            // 创建变量用于保存匹配的数字
            var number = ''
            // 循环遍历接下来的字符，直到下一个字符不是数字为止
            while (NUMBER.test(char)) {
                number += char
                char = input[++current]
            }
            // 最后把数据更新到 tokens 中
            tokens.push({
                type: 'Numeric',
                value: number
            })
            // 进入下一次循环
            continue
        }

        // 处理字符的情况
        var LETTERS = /[a-z]/i
        if (LETTERS.test(char)) {
            var value = ''

            // 用一个循环遍历所有的字母，把它们存入 value 中。
            while (LETTERS.test(char)) {
                value += char  
                char = input[++current]
            }
            // 判断当前字符串是否是关键字 
            KEYWORD = /function|var|return|let|const|if|for/i
            if (KEYWORD.test(value)) {
                // 标记关键字
                tokens.push({
                    type: 'Keyword',
                    value: value
                })
            } else {
                // 标记变量
                tokens.push({
                    type: 'Identifier',
                    value: value
                })
            }
            // 进入下一次循环
            continue
        }

        throw new Error('不能够被识别的字符')
    }

    return tokens
}