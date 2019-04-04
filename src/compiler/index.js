const parser = require('../parser/parser');
const evaluate = require('./eval');
const { Scope } = require('./scope');

const create_interpreter = () => {
  // create scope
  const scope = new Scope('block');
  // install lib function

  return code => {
    const { ast, error } = parser(code);
    if (error) {
      console.log(error);
    }
    evaluate(ast, scope);
  }
};

module.exports = {
  create_interpreter
};