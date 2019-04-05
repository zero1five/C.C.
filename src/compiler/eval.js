const { Scope } = require('./scope');

const BREAK_SINGAL = {};
const CONTINUE_SINGAL = {};
const RETURN_SINGAL = { result: undefined };

const eval_expression = (expr, localEnv) => {
  switch (expr.type) {
    case 'Program':
      for (const node of expr.body) evaluate(node, localEnv);
      break;
    case 'Identifier':
      if (expr.name === 'undefined') return undefined
      const $var = localEnv.$find(expr.name);
      if ($var) { return $var.$get() }
      else { throw `[Error]${expr.loc}, '${expr.name}' undefined` };
    case 'Literal':
      return expr.value;
    case 'MemberExpression':
      const { object, property, computed } = expr;
      if (computed) {
        return evaluate(object, localEnv)[evaluate(property, localEnv)];
      } else {
        return evaluate(object, localEnv)[property.name];
      }
    case 'BlockStatement':
      let new_scope = localEnv.invasived ? localEnv : new Scope('block', localEnv)
      for (const node of expr.body) {
          const result = evaluate(node, new_scope)
          if (result === BREAK_SINGAL
              || result === CONTINUE_SINGAL
              || result === RETURN_SINGAL) {
              return result
          }
      }
      break;
    case 'ExpressionStatement':
      evaluate(expr.expression, localEnv);
      break;
    case 'ArrowFunctionExpression':
      return function(...args) {
        const new_Scope = new Scope('arrowFunction', localEnv);
        const { params, body } = expr;
        new_Scope.invasived = true
        params.map((param, idx) => new_Scope.$const(param.name, args[idx]));
        new_Scope.$const('this', this)
        new_Scope.$const('arguments', arguments)
        const result = evaluate(body, new_Scope)
        if (result === RETURN_SINGAL) {
            return result.result
        }
      }
    case 'CallExpression':
      const func = evaluate(expr.callee, localEnv);
      const args = expr.arguments.map(arg => evaluate(arg, localEnv));
      if (expr.callee.type === 'MemberExpression') {
       const object = evaluate(expr.callee.object, localEnv);
       return func.apply(object, args);
      } else {
        const this_val = localEnv.$find('this')
        return func.apply(this_val ? this_val.$get() : null, args)
      }
      break;
    case 'VariableDeclaration':
      const { kind } = expr;
      for (const declartor of expr.declarations) {
        const { name } = declartor.id
        const value = declartor.init ? evaluate(declartor.init, localEnv) : undefined
        if (!localEnv.$declar(kind, name, value)) {
          throw `[Error] ${name} 重复定义`
        }
      }
      break;
    case 'BinaryExpression':
      return ({
        "==": (a, b) => a == b,
        "!=": (a, b) => a != b,
        "===": (a, b) => a === b,
        "!==": (a, b) => a !== b,
        "<": (a, b) => a < b,
        "<=": (a, b) => a <= b,
        ">": (a, b) => a > b,
        ">=": (a, b) => a >= b,
        "<<": (a, b) => a << b,
        ">>": (a, b) => a >> b,
        ">>>": (a, b) => a >>> b,
        "+": (a, b) => a + b,
        "-": (a, b) => a - b,
        "*": (a, b) => a * b,
        "/": (a, b) => a / b,
        "%": (a, b) => a % b,
        "|": (a, b) => a | b,
        "^": (a, b) => a ^ b,
        "&": (a, b) => a & b,
        "in": (a, b) => a in b,
        "instanceof": (a, b) => a instanceof b
      })[expr.operator](evaluate(expr.left, localEnv), evaluate(expr.right, localEnv));
    default:
      // console.log(expr)
      break;
  }
};

const evaluate = (expression, localEnvironment) => {
  return eval_expression(expression, localEnvironment);
};

module.exports = evaluate;