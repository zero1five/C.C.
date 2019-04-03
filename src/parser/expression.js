const { rule } = require('./parserBase');
const { Token } = require('../lexer/lexer');

const statement = rule();
const rootProgram = rule().option(statement).sep(';', Token.EOF);

module.exports = rootProgram