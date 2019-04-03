const { chain, many, matchTokenType, optional, plus } = require('syntax-parser');

const parseTermAst = (ast) =>
  ast[1]
    ? ast[1].reduce(
        (obj, next) =>
          next[0]
            ? {
                operator: next[0],
                left: obj || ast[0],
                right: next[1]
              }
            : {
                operator: next[1] && next[1].operator,
                left: obj || ast[0],
                right: next[1] && next[1].right
              },
        null
      )
    : ast[0];

const rootProgram = () => chain(term, many(addOp, rootProgram))(parseTermAst);

const term = () => chain(factor, many(mulOp, rootProgram))(parseTermAst);

const mulOp = () => chain(['*', '/'])(ast => ast[0].value);

const addOp = () => chain(['+', '-'])(ast => ast[0].value);

const factor = () => chain([
    chain('(', rootProgram, ')')(ast => ast[1]),
    chain(matchTokenType('Literal'))(ast => ast[0].value)
])(ast => ast[0]);

module.exports = rootProgram