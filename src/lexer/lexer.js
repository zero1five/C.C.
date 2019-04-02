class Tokenizer {
  constructor(lexerConfig) {
    this.lexerConfig = lexerConfig;
  }

  tokenize(input) {
    const tokens = [];
    let token;
    let lastPosition = 0;
    let rows = 1;

    // Keep processing the string until it is empty
    while (input.length) {
      // Get the next token and the token type
      const result = this.getNextToken(input);

      if (!result || !result.token) {
        throw Error(`Lexer: Unexpected string "${input}".`);
      }

      token = result.token;

      if (!token.value) {
        throw Error(`Lexer: Regex parse error, please check your lexer config.`);
      }

      // Get rows 
      if (token.value.indexOf('\n') !== -1) {
        const newLines = token.value.match(/\n/g).length;
        if (newLines > 1) {
          rows += newLines;
        } else {
          rows++;
        }
      }

      token.position = [lastPosition, lastPosition + token.value.length];
      token.row = rows;
      lastPosition += token.value.length;

      // Advance the string
      input = input.substring(token.value.length);

      if (!result.config.ignore) {
        tokens.push(token);
      }
    }
    return tokens;
  }

  getNextToken(input) {
    for (const eachLexer of this.lexerConfig) {
      for (const regex of eachLexer.regexes) {
        const token = this.getTokenOnFirstMatch({ input, type: eachLexer.type, regex });
        if (token) {
          return {
            token,
            config: eachLexer
          };
        }
      }
    }

    return null;
  }

  getTokenOnFirstMatch({ input, type, regex }) {
    const matches = input.match(regex);
    if (matches) {
      return { type, value: matches[0] };
    }
  }
}

const createLexer = rules => code => new Tokenizer(rules).tokenize(code);

module.exports = { createLexer };