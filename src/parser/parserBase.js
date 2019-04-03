const Scanner = require('./scanner');
const { VisiterOption, VisiterStore, Parser } = require('./interface');
const { tailCallOptimize } = require('./utils');

class Ruler {
  constructor() {};
};

const getParser = (root) => {
  const parser = new Parser();
  parser.rootChainNode = root()(null, null, 0, parser);
  return parser;
}

function newVisit({ node, scanner, visiterOption, parser }) {
  const defaultVisiterOption = new VisiterOption();
  defaults(visiterOption, defaultVisiterOption);

  const newStore = new VisiterStore(scanner, parser);
  visit({ node, store: newStore, visiterOption, childIndex: 0 });
}

const visit = tailCallOptimize(({ node, store, visiterOption, childIndex }) => {
  if (store.stop) {
    fail(node, store, visiterOption);
    return;
  }

  if (!node) {
    throw Error('no node!');
  }

  if (visiterOption.onCallVisiter) {
    visiterOption.onCallVisiter(node, store);
  }

  if (node instanceof ChainNode) {
    if (firstSetUnMatch(node, store, visiterOption, childIndex)) {
      return; // If unmatch, stop!
    }

    visitChildNode({ node, store, visiterOption, childIndex });
  } else if (node instanceof TreeNode) {
    visitChildNode({ node, store, visiterOption, childIndex });
  } else if (node instanceof MatchNode) {
    if (node.matching.type === 'loose') {
      if (node.matching.value === true) {
        visitNextNodeFromParent(node, store, visiterOption, null);
      } else {
        throw Error('Not support loose false!');
      }
    } else {
      visiterOption.onMatchNode(node, store, visiterOption);
    }
  } else if (node instanceof FunctionNode) {
    const functionName = node.chainFunction.name;
    const replacedNode = node.run();
    replacedNode.functionName = functionName;

    node.parentNode.childs[node.parentIndex] = replacedNode;
    visit({ node: replacedNode, store, visiterOption, childIndex: 0 });
  } else {
    throw Error('Unexpected node type: ' + node);
  }
});

function visitChildNode({ node, store, visiterOption, childIndex }) {
  if (node instanceof ChainNode) {
    const child = node.childs[childIndex];
    if (child) {
      visit({ node: child, store, visiterOption, childIndex: 0 });
    } else {
      visitNextNodeFromParent(
        node,
        store,
        visiterOption,
        visiterOption.generateAst ? node.solveAst(node.astResults) : null
      );
    }
  } else {
    // This case, Node === TreeNode
    const child = node.childs[childIndex];
    if (childIndex + 1 < node.childs.length) {
      addChances({
        node,
        store,
        visiterOption,
        tokenIndex: store.scanner.getIndex(),
        childIndex: childIndex + 1,
        addToNextMatchNodeFinders: true
      });
    }
    if (child) {
      visit({ node: child, store, visiterOption, childIndex: 0 });
    } else {
      throw Error('tree node unexpect end');
    }
  }
}

class BaseParser {
  constructor(rootProgram) { 
    this.root = rootProgram;
  };
  
  parse(tokens) {
    const parser = getParser(this.root);
    const originScanner = new Scanner(tokens);

    let ast = null;

    newVisit({
      node: parser.rootChainNode,
      scanner,
      visiterOption: {
        onCallVisiter: (node, store) => {
          callVisiterCount++;
  
          if (callVisiterCount > MAX_VISITER_CALL) {
            store.stop = true;
          }
        },
        onVisiterNextNode: (node, store) => {
          callParentCount++;
          if (callParentCount > MAX_VISITER_CALL) {
            store.stop = true;
          }
        },
        onSuccess: () => {
          ast = parser.rootChainNode.solveAst
            ? parser.rootChainNode.solveAst(parser.rootChainNode.astResults)
            : parser.rootChainNode.astResults;
        },
        onMatchNode: (matchNode, store, currentVisiterOption) => {
          const matchResult = matchNode.run(store.scanner);
  
          if (!matchResult.match) {
            tryChances(matchNode, store, currentVisiterOption);
          } else {
            // If cursor prev token isn't null, it may a cursor prev node.
            if (cursorPrevToken !== null && matchResult.token === cursorPrevToken) {
              cursorPrevNodes.push(matchNode);
            }
  
            visitNextNodeFromParent(matchNode, store, currentVisiterOption, {
              token: true,
              ...matchResult.token
            });
          }
        }
      },
      parser
    });

  };
};

const rule = () => new Ruler();
const createParser = (rootProgram) => (tokens) => new BaseParser(rootProgram).parse(tokens);

module.exports = { createParser, rule };