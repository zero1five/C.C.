class Parser {
  constructor() {
    this.rootChainNode = null;
    this.firstSet = new Map();
    this.firstOrFunctionSet = new Map();
    this.relatedSet = new Map();
  }
}

class VisiterStore {
  constructor(scanner, parser) {
    this.scanner = scanner;
    this.parser = parser;
  }
}

class VisiterOption {}

module.exports = { Parser, VisiterStore, VisiterOption }