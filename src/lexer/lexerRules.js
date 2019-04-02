const lexerRules = [
  { 
    /* 空格 */
    type: 'whitespace',
    regexes: [/^(\s+)/],
    ignore: true
  },
  {
    /* 注释 */
    type: 'comment',
    regexes: [
      /\/\/(.*)\n/,
      /\/\*([^]*)\*\/\n/,
      /\/\*\*([^]*)\*\//
    ],
    ignore: true
  },
  {
    /* 文字 */
    type: 'Literal',
    regexes: [/^([a-zA-Z0-9]+)/]
  },
  {
    /* 操作符 */
    type: 'operator',
    regexes: [
      /^(\(|\))/,
      /^(\+|\-|\*|[^\/]\/[^\/])/
    ]
  }
];

module.exports = lexerRules