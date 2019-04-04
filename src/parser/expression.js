const { chain, many, matchTokenType, optional, plus } = require('syntax-parser');

const parseTermAst = (ast) =>
  ast[1]
    ? ast[1].reduce(
        (obj, next) =>
          next[0]
            ? {
                type: 'BinaryExpression',
                operator: next[0],
                left: obj || ast[0],
                right: next[1]
              }
            : {
                type: 'BinaryExpression',
                operator: next[1] && next[1].operator,
                left: obj || ast[0],
                right: next[1] && next[1].right
              },
        null
      )
    : ast[0];

/** 
 * const let 
 * 1 + 3
 * call
 */

const rootProgram = () => chain([expression, variable])(ast => ({
  type: 'Program',
  body: ast
}));

const expression = () => chain([binary], many(rootProgram))(ast => ({
  type: 'ExpressionStatement',
  expression: ast[0]
}));

const variable = () => chain(matchTokenType('Declarator'), Identifier/* '=', matchTokenType('Literal') */, many(rootProgram))(ast => ({
  type: 'VariableDeclaration',
  decalarations: ast 
}));

/** arithmetic */

const binary = () => chain(term, many(addOp, binary))(parseTermAst);

const term = () => chain(factor, many(mulOp, binary))(parseTermAst);

const mulOp = () => chain(['*', '/', '%'])(ast => ast[0].value);

const addOp = () => chain(['+', '-'])(ast => ast[0].value);

const factor = () => chain([
    chain('(', binary, ')')(ast => ast[1]),
    chain(matchTokenType('Literal'))(ast => ast[0].value),
])(ast => ast[0]);

const Identifier = () => chain(matchTokenType('Identifier'))(ast => ({
  type: 'Identifier',
  name: ast[0].value
}));

module.exports = rootProgram