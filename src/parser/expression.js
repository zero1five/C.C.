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

const rootProgram = () => chain([binary, expression])(ast => ({
  type: 'Program',
  body: [ast[0]]
}));

const expression = () => chain([Identifier, binary], many(expression))(ast => ast[0]);

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