#!/usr/bin/env node

/**
 * 语法设计：
 * 1 + 3
 * print('') | print("%s %s %s", a, b, c)
 * \x -> x
 * 模式匹配
 */

/**
 * 词法解析器
 */

/**
 * 语法解析器
 */

/**
 *  1. ast 以 program 开始
 *  2. ast 支持 print
 */

const { argv } = require('process');
const { readFileSync } = require('fs');
const { create_interpreter } = require('./compiler');

const Main = () => {
  const [source, target, ...params] = argv;
  const [filePath, ...extra] = params;

  if (!params.length) {
    // todo: 命令行交互模式
  }

  const fp = readFileSync(filePath, 'utf-8');
  const interpreter = create_interpreter();
  interpreter(fp);

};

Main();