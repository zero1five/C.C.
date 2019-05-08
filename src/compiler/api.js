const api = {
  printStr: (templete, ...params) => {
    const regex = /%s/g;
    if (!templete) {
      throw `[Error]print: need template are you sure one params exits`
    }
    if (templete.match(regex).length !== params.length) {
      throw `[Error]print: template and params length not match`
    }
    while(params.length) {
      templete = templete.replace(/%s/, params.shift());
    }
    printWithNative(templete);
  },
  print: function() {
    return printWithNative([...arguments].map(arg => arg.flag === '$$lazyCall' ? arg.valueOf() : arg));
  }
}

const printWithNative = args => {
  if (args.length === 1) {
    console.log.call(null, args[0]);
  } else {
    console.log.apply(null, ...args)
  }
};

module.exports = api