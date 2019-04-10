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
  let [callee, left, args, right] = callBody;
  if (args && args.value === ')') {
    args = []
  }
  return {
    type: 'CallExpression',
    callee,
    arguments: args
  }
};

const parseBlockAst = (ast) => {
  const [[start, body, end]] = ast;

  return {
    type: 'BlockStatement',
    body: body ? body.body : []
  }
};

const parseReturnAst = ast => {
  const [[returnTag, expr]] = ast;
  return {
    type: 'ReturnStatement',
    argument: expr
  }
}

const parseAssignAst = (ast) => {
  const [[target, operator, source]] = ast;
  return {
    type: 'AssignmentExpression',
    operator: operator.value,
    left: target,
    right: source
  }
};

const parseCaseAst = (ast) => {
  const [[caseToken, left, discriminant, right, { body }]] = ast;

  return {
    type: 'CaseStatement',
    cases: body,
    discriminant
  }
}

const parseWhenAst = (ast) => {
  const [[when, test, arrow, consequent]] = ast;
  return {
    type: 'CaseWhen',
    test,
    consequent
  }
};

const parseArrayAst = (ast) => {
  const [[start, elements, end]] = ast;
  return {
    type: 'ArrayExpression',
    elements
  }
};

const parseObjectAst = (ast) => {
  const [[ start, propertiesAST, end ]] = ast;
  const properties = propertiesAST.map(property => {
    const [key, infix, value] = property;
    return {
      type: 'Property',
      key, 
      value
    }
  });
  return { 
    type: 'ObjectExpression',
    properties
  }
};

const parseArrowFunctionAst = (ast) => {
  let [[left, right, arrow, body]] = ast,
      params = [];

  // a => {}
  if (left.value !== '(') {
    [[params, arrow, body]] = ast;
    return {
      type: 'ArrowFunctionExpression',
      body,
      params: [params]
    }
  } else {
    if(right instanceof Array) {
      [[left, params, right, arrow, body]] = ast;
    }
    return {
      type: 'ArrowFunctionExpression',
      body,
      params: params.length ? params : []
    }
  }
};

const rootProgram = () => chain(plus([expression, variable, statement]))(ast => ({
  type: 'Program',
  body: ast[0]
}));

const expression = () => chain([
    callExpression, 
    ObjectExpression,
    AssignmentExpression, 
    arrowFunctionExpression,
    arrayExpression,
    binary
])(ast => ({
  type: 'ExpressionStatement',
  expression: ast[0]
}));

const statement = () => chain([
  chain(returnStatement),
  chain(caseStatement),
  chain(whenStatement),
  chain(BlockStatement),
])(ast => ast[0][0]);

const BlockStatement = () => chain([
  chain(matchTokenType('blockStart'), optional(rootProgram), matchTokenType('blockEnd'))
])(parseBlockAst);

const returnStatement = () => chain([
  chain(matchTokenType('return'), optional([Identifier, expression]))
])(parseReturnAst);

const caseStatement = () => chain([
  chain(matchTokenType('case'), '(', [atom, expression], ')', BlockStatement)
])(parseCaseAst);

const whenStatement = () => chain([
  chain(matchTokenType('when'), ObjectExpression, matchTokenType('whenArrow'), BlockStatement)
])(parseWhenAst);

const AssignmentExpression = () => chain([
  chain(Identifier, matchTokenType('operator'), [Literal, Identifier, expression])
])(parseAssignAst);

const ObjectExpression = () => chain([
  chain(
    matchTokenType('blockStart'), 
    optional(plus([
      chain(atom, matchTokenType('infix'), atom),
      chain(atom),
    ])), 
    matchTokenType('blockEnd')
  ),
])(parseObjectAst);

const arrowFunctionExpression = () => chain([
  chain(Identifier, matchTokenType('arrowFunction'), BlockStatement),
  chain(Identifier, matchTokenType('arrowFunction'), expression),
  chain("(", ")", matchTokenType('arrowFunction'), BlockStatement),
  chain("(", plus([Identifier]), ")", matchTokenType('arrowFunction'), optional([expression, BlockStatement])),
])(parseArrowFunctionAst);

const arrayExpression = () => chain([
    chain(matchTokenType('arrayStart'), optional(many([Identifier, Literal, expression])), matchTokenType('arrayEnd'), optional(';'))
])(parseArrayAst);

const callExpression = () => chain([
  chain(Identifier, "(", optional(plus([Literal, Identifier, binary, callExpression, expression])), ")", optional(";")),
])(parseCallAst);

const variable = () => chain([
  chain(matchTokenType('Declarator'), Identifier),
  chain(matchTokenType('Declarator'), Identifier, '=', optional([Literal, arrowFunctionExpression, ObjectExpression])),
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
    chain([Literal, Identifier])(ast => ast[0]),
])(ast => ast[0]);

/** atomic  */

const atom = () => chain([Literal, Identifier])(ast => ast[0]);

const Literal = () => chain(matchTokenType('Literal'))(ast => ({
  ...ast[0],
  type: 'Literal',
  value: /^([0-9]+)(\.[0-9]+)?$/.test(ast[0].value) 
    ? Number(ast[0].value) 
    : ast[0].value.slice(1, -1)
}));

const Identifier = () => chain(matchTokenType('Identifier'))(ast => ({
  ...ast[0],
  type: 'Identifier',
  name: ast[0].value
}));

module.exports = rootProgram