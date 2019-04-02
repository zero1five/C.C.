/**
 * 词法分析 -> 分解为 token -> 运算符优先级计算
 * 语法分析 -> 生成 ast tree
 */
const { createLexer } = require('../lexer/lexer');
const lexerRules = require('../lexer/lexerRules');

const parser = (code) => {
  const Lexer = createLexer(lexerRules, { /* options */ });
  console.log(Lexer(code));
};

module.exports = parser;