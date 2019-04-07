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
      const $var_indent = localEnv.$find(expr.name);
      if ($var_indent) { return $var_indent.$get() }
      else { throw `Uncaught ReferenceError: ${expr.name} is not defined` };
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
    case 'ReturnStatement': 
      RETURN_SINGAL.result = expr.argument ? evaluate(expr.argument, localEnv) : undefined
      return RETURN_SINGAL
    case 'AssignmentExpression':
      const { left, right } = expr;
      let $var = localEnv.$find(left.name);
      if (!$var) throw `Uncaught ReferenceError: ${left.name} is not defined`;
      if ($var.kind === 'const') throw `Uncaught TypeError: Assignment to constant variable.`
      return ({
          "=": (v) => ($var.$set(v), v),
          "+=": (v) => ($var.$set($var.$get() + v), $var.$get()),
          "-=": (v) => ($var.$set($var.$get() - v), $var.$get()),
          "*=": (v) => ($var.$set($var.$get() * v), $var.$get()),
          "/=": (v) => ($var.$set($var.$get() / v), $var.$get()),
          "%=": (v) => ($var.$set($var.$get() % v), $var.$get()),
          "<<=": (v) => ($var.$set($var.$get() << v), $var.$get()),
          ">>=": (v) => ($var.$set($var.$get() >> v), $var.$get()),
          ">>>=": (v) => ($var.$set($var.$get() >>> v), $var.$get()),
          "|=": (v) => ($var.$set($var.$get() | v), $var.$get()),
          "^=": (v) => ($var.$set($var.$get() ^ v), $var.$get()),
          "&=": (v) => ($var.$set($var.$get() & v), $var.$get())
      })[expr.operator](evaluate(expr.right, localEnv))

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
      console.log(expr)
      break;
  }
};

const evaluate = (expression, localEnvironment) => {
  return eval_expression(expression, localEnvironment);
};

module.exports = evaluate;