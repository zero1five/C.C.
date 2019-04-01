const parser = require('./parser');
const evaluate = require('./eval');
const { Scope } = require('./scope');

const create_interpreter = () => {
  // create scope
  const scope = new Scope('block');
  // install lib function

  return code => {
    const ast = parser(code);
    evaluate(ast, scope);
  }
};

module.exports = {
  create_interpreter
};