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

const parseVariableAst = (ast) => 
  ast.map(obj => ({
    type: 'VariableDeclarator',
    id: obj[1],
    init: obj[2] ? obj[3] : null
  }));

const parseCallAst = (ast) => ({
  type: 'CallExpression',
  call: ast[0][0],
  arguments: []
});

/** 
 * const let ✅
 * 1 + 3 ✅
 * call 
 */

const rootProgram = () => chain(plus([expression, variable]))(ast => ({
  type: 'Program',
  body: ast[0]
}));

const expression = () => chain([binary, callExpression])(ast => ({
  type: 'ExpressionStatement',
  expression: ast[0]
}));

const callExpression = () => chain([
  chain(Identifier, "(", ")"),
  chain(Identifier, "(", ")", ";"),
])(parseCallAst);

const variable = () => chain([
  chain(matchTokenType('Declarator'), Identifier),
  chain(matchTokenType('Declarator'), Identifier, '=', matchTokenType('Literal')),
])(ast => ({
  type: 'VariableDeclaration',
  kind: ast[0][0].value,
  declarations: parseVariableAst(ast)
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

/** atomic  */

const Identifier = () => chain(matchTokenType('Identifier'))(ast => ({
  type: 'Identifier',
  name: ast[0].value
}));

module.exports = rootProgram