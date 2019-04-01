/**
 * 词法分析 -> 分解为 token
 * 语法分析 -> 生成 ast tree
 */
const { createLexer } = require('./lexer');

const parser = (code) => {
  const Lexer = createLexer(rules);
  Lexer(code);
};

const rules = [
  { 
    /* 空格 */
    type: 'whitespace',
    regexes: [/^(\s+)/],
    ingore: true
  },
  {
    /* 文字 */
    type: 'Literal',
    regexes: [/^([a-zA-Z0-9]+)/]
  },
  {
    /* 操作符 */
    type: 'operator',
    regexes: [
      /^(\(|\))/,
      /^(\+|\-|\*|\/)/
    ]
  }
];

module.exports = parser;