/**
 * 词法分析 -> 分解为 token -> 运算符优先级计算
 * 语法分析 -> 生成 ast tree
 */
const { createLexer } = require('../lexer/lexer');
const lexerRules = require('../lexer/lexerRules');

const { createParser } = require('./parserBase');
const rootProgram = require('./expression');

const parser = (code) => {
  const Lexer = createLexer(lexerRules, { /* options */ });
  const Parser = createParser(rootProgram);

  return Parser(Lexer(code));
};

module.exports = parser;