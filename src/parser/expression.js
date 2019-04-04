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

const parseCallAst = (ast) => {
  const [callBody] = ast;
  const [callee, left, right] = callBody;
  let args = [];
  if (right.value !== ')') {
    args = callBody.slice(2, callBody.indexOf(x => x.value === ')') - 1);
  }
  return {
    type: 'CallExpression',
    call: callee,
    arguments: args
  }
};

const parseBlockAst = (ast) => {
  const [start, body, end] = ast;

  return {
    type: 'BlockStatement',
    body: body ? body.body : []
  }
};

const parseArrowFunctionAst = (ast) => {
  let [[left, right, arrow, body]] = ast,
      params = [];
  if(right instanceof Array) {
    [[left, params, right, arrow, body]] = ast;
  }
  return {
    type: 'ArrowFunctionExpression',
    body,
    params: params.length ? params : []
  }
};

/** 
 * const let ✅
 * 1 + 3 ✅
 * call ✅
 * arrowFunction () => {}
 */

const rootProgram = () => chain(plus([expression, variable, BlockStatement]))(ast => ({
  type: 'Program',
  body: ast[0]
}));

const expression = () => chain([binary, callExpression, arrowFunctionExpression])(ast => ({
  type: 'ExpressionStatement',
  expression: ast[0]
}));

const BlockStatement = () => chain(
  matchTokenType('blockStart'), optional(rootProgram), matchTokenType('blockEnd')
)(parseBlockAst);

const arrowFunctionExpression = () => chain([
  chain("(", ")", matchTokenType('arrowFunction'), BlockStatement),
  chain("(", plus([Identifier]), ")", matchTokenType('arrowFunction'), BlockStatement),
])(parseArrowFunctionAst);

const callExpression = () => chain([
  chain(Identifier, "(", ")", optional(";")),
  chain(Identifier, "(", many([Literal, Identifier]), ")", optional(";"))
])(parseCallAst);

const variable = () => chain([
  chain(matchTokenType('Declarator'), Identifier),
  chain(matchTokenType('Declarator'), Identifier, '=', Literal),
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
    chain(Literal)(ast => ast[0]),
])(ast => ast[0]);

/** atomic  */

const Literal = () => chain(matchTokenType('Literal'))(ast => ({
  ...ast[0],
  type: 'Literal',
  value: ast[0].value
}));

const Identifier = () => chain(matchTokenType('Identifier'))(ast => ({
  ...ast[0],
  type: 'Identifier',
  name: ast[0].value
}));

module.exports = rootProgram