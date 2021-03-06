const { isEqual } = require('lodash');
const { Scope } = require('./scope');
const api = require('./api');

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
    case 'ObjectExpression':
      const { properties } = expr,
            objectContainer = {};
      for (const property of properties) {
        let key;
        if (property.key.type === 'Literal') {
          key = evaluate(property.key, scope)
        } else if (property.key.type === 'Identifier') {
          key = property.key.name
        }
        const value = evaluate(property.value ? property.value : property.key, localEnv)
        objectContainer[key] = value
      }
      return objectContainer;
    case 'ArrayExpression': 
      const { elements } = expr;
      const arr = new Array();
      for (let i = 0, l = elements.length; i < l; i++) {
        arr.push(evaluate(elements[i]))
      }
      return arr
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
    case 'CaseStatement':
      let newScope = localEnv.invasived ? localEnv : new Scope('block', localEnv);
      const { cases, discriminant } = expr;
      const target = evaluate(discriminant, newScope);

      for (const when of cases) {
        const { test, consequent } = when;
        const left = evaluate(test, newScope);
        if (isEqual(left, target)) {
          return evaluate(consequent, newScope);
        }
      }
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
      return evaluate(expr.expression, localEnv);
    case 'ArrowFunctionExpression':
      return function(...args) {
        const new_Scope = new Scope('arrowFunction', localEnv);
        const { params, body } = expr;
        new_Scope.invasived = true;
        params.map((param, idx) => new_Scope.$const(param.name, args[idx]));
        new_Scope.$const('this', this);
        new_Scope.$const('arguments', arguments);
        const result = evaluate(body, new_Scope);
        if (result === RETURN_SINGAL) {
          return result.result
        }
      }
    case 'CallExpression':
      const nativeFn = Object.keys(api);
      const func = evaluate(expr.callee, localEnv);

      const _call = () => {
        const args = expr.arguments.map(arg => evaluate(arg, localEnv));
        if (expr.callee.type === 'MemberExpression') {
          const object = evaluate(expr.callee.object, localEnv);
          return func.apply(object, args);
        } else {
          const this_val = localEnv.$find('this');
          return func.apply(this_val ? this_val.$get() : null, args);
        }
      };
      if (!nativeFn.includes(func.name)) {
        // ordinary function
        return {
          flag: '$$lazyCall',
          valueOf: () => _call()
        }
      }
      // native function call
      return _call();
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