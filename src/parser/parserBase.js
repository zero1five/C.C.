const Scanner = require('./scanner');

/**
 * visitor 扫描结构
 * 
 */

class Ruler {
  constructor() {};

  option() {
    return this;
  }

  sep() {
    return this;
  }
};

class Parser {

}

const getParser = (root) => {
  const parser = new Parser();
  parser.rootChainNode = root;
  return parser;
}

class BaseParser {
  constructor(rootProgram) { 
    this.root = rootProgram;
  };
  
  parse(tokens) {
    const parser = getParser(this.root);
    const originScanner = new Scanner(tokens);

    
  };
};

const rule = () => new Ruler();
const createParser = (rootProgram) => (tokens) => new BaseParser(rootProgram).parse(tokens);

module.exports = { createParser, rule };