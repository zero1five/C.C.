// rule().sep("(").ast(expr).sep(")");

class Scanner {
  constructor() {};
  
  option() {};

  sep() {};

  ast() {};
}

class Parser {
  constructor(rootProgram) { 
    this.root = rootProgram;
  };
  
  parse() {};
}

const rule = () => new Scanner();
const createParser = (rootProgram) => (tokens) => new Parser(rootProgram).parse(tokens);

module.exports = { createParser, rule };