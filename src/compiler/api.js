const api = {
  print: (templete, ...params) => {
    const regex = /%s/g;
    if (!templete) {
      throw `[Error]print: need template are you sure one params exits`
    }
    if (templete.match(regex)[0].length !== params.length) {
      throw `[Error]print: template and params length not match`
    }
    while(params.length) {
      templete = templete.replace(/%s/, params.shift());
    }
    console.log(templete);
  }  
}

module.exports = api