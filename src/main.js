#!/usr/bin/env node

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