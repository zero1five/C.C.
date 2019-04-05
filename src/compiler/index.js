const parser = require('../parser/parser');
const api = require('./api');
const evaluate = require('./eval');
const { Scope } = require('./scope');

const create_interpreter = () => {
  // create scope
  const scope = new Scope('block');
  // install lib function
  for (const name of Object.getOwnPropertyNames(api)) {
    scope.$const(name, api[name])
  }

  return code => {
    const { ast, error } = parser(code);
    if (error) {
      console.log(error);
    } else {
      evaluate(ast, scope);
    }
  }
};

module.exports = {
  create_interpreter
};