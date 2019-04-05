const lexerRules = [
  { 
    /* 空格 */
    type: 'whitespace',
    regexes: [/^(\s)/],
    ignore: true
  },
  {
    /* 注释 */
    type: 'comment',
    regexes: [
      /^\/\/(.*)\n/,
      /^\/\*([^]+?)\*\//,
      /^\/\*\*([^]+?)\*\//
    ],
    ignore: true
  },
  {
    /* Separator */
    type: 'separator',
    regexes: [
      /^(,|;)/
    ],
    ignore: true
  },
  {
    /* 文字 */
    type: 'Literal',
    regexes: [
      /^([0-9]+)/,
      /^"[^]+"/
    ]
  },
  {
    /* 操作符 */
    type: 'operator',
    regexes: [
      /^(\(|\))/,
      /^(\+|\-|\*|\/|=(?!>))/
    ]
  },
  {
    /* 标识符 */
    type: 'Identifier',
    regexes: [
      /^((?!(let|const))[a-zA-Z]+(?!(let|const)))/,
    ]
  },
  {
    /* 声明变量 */
    type: 'Declarator',
    regexes: [/^(let|const)/]
  },
  {
    type: 'blockStart',
    regexes: [/^{/]
  },
  {
    type: 'blockEnd',
    regexes: [/^}/]
  },
  {
    /* 声明函数 */
    type: 'arrowFunction',
    regexes: [
      /^=>/
    ]
  }
];

module.exports = lexerRules