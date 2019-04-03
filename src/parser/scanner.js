class Scanner {
  constructor(tokens, index = 0) {
    this.tokens = tokens;
    this.index = index;
  };

  read() {
    const token = this.tokens[this.index];
    if (token) {
      return token;
    } else {
      return false;
    }
  };

  next() {
    return this.index++;
  };

  isEnd() {
    return this.index >= this.tokens.length;
  };  
  
  getIndex() { 
    return this.index;
  };

  setIndex(index) {
    return (this.index = index);
  } 
};

module.exports = Scanner;