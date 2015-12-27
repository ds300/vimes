import * as d from './data';

const EOF = "";

const CONTROL = /[\[\]\{\}\(\)\\"\s,]/

class LispReader {
  line: number = 0;
  column: number = 0;
  offset: number = 0;
  filename: string;
  text: string;
  char: string;
  namespace: string;
  constructor (text: string, filename: string, namespace?: string) {
    this.text = text;
    this.filename = filename;
    this.char = text[0];
    this.namespace = namespace || null;
  }
  skipWhitespace() {
    while (this.char.match(/\s/) || this.char === ',') {
      this.nextChar();
    }
  }

  nextChar(expecting?: boolean) {
    this.char = this.text[++this.offset];
    if (this.char === '\n') {
      this.line++;
      this.column = 0;
    } else {
      this.column++;
    }

    if (this.offset >= this.text.length) {
      if (expecting) {
        throw new Error('unexpected EOF');
      } else {
        this.char = EOF;
      }
    }
  }

  _readSymbol(): any {
    let sym = this.char;
    this.nextChar();
    while (this.char !== EOF && !this.char.match(CONTROL)) {
      sym += this.char;
      this.nextChar();
    }

    switch (sym) {
      case "nil": return null;
      case "false": return false;
      case "true": return true;
      case "NaN": return Number.NaN;
      case "Infinity":
      case "+Infinity": return Number.POSITIVE_INFINITY;
      case "-Infinity": return Number.NEGATIVE_INFINITY;
      default: break;
    }

    if (sym.match(/^-?([1-9]\d*|0)?(\.\d+)?([eE](\+|-)?\d+)?$/)) {
      return parseFloat(sym);
    } else if (sym[0] === ':') {
      if (sym[1] === ':') {
        if (sym.indexOf('/')) {
          throw new Error('invalid token:' + sym);
        }
        return new d.Keyword(this.namespace, sym.slice(2));
      } else {
        return d.keyword(sym.slice(1));
      }
    } else if (sym[0].match(/\d/)) {
      throw new Error('invalid token: ' + sym);
    } else {
      return d.symbol(sym);
    }
  }

  _readList() {
    return new d.ArraySeq(this._readSeq(')'), 0);
  }

  _readVector() {
    return new d.ArrayVector(this._readSeq(']'));
  }

  _readMap() {
    const arr = this._readSeq('}');
    if (arr.length % 2 !== 0) {
      throw new Error('map literal must have even number of forms');
    }
    return new d.ArrayMap(arr);
  }

  _readSet() {
    return new d.ArraySet(this._readSeq('}'));
  }

  _readSeq(endDelimiter): any[] {
    const result = [];
    this.nextChar(true);
    this.skipWhitespace();
    while (this.char !== endDelimiter) {
      result.push(this.nextForm());
      this.skipWhitespace();
    }
    this.nextChar();
    return result;
  }

  _readString() {
    this.nextChar(true);
    let string = "";
    while (this.char !== '"') {
      if (this.char === '\\') {
        this.nextChar(true);
        switch (this.char) {
        case "t":
          string += '\t';
          break;
        case "n":
          string += '\n';
          break;
        case "r":
          string += '\r';
          break;
        case "b":
          string += '\b';
          break;
        case "f":
          string += '\f';
          break;
        case '"':
          string += '"';
          break;
        case "\\":
          string += '\\';
          break;
        case "u":
          let charCode = 0;
          for (var i = 0; i < 4; i++) {
            this.nextChar(true);
            const part = parseInt(this.char, 16);
            if (isFinite(part)) {
              charCode = charCode * 16 + part;
            } else {
              throw new Error('not a hex digit: ' + this.char);
            }
          }
          string += String.fromCharCode(charCode);
        }
      } else {
        string += this.char;
      }
      this.nextChar(true);
    }
    this.nextChar();
    return string;
  }

  _readRegExp() {
    this.nextChar(true);
    let repr = "";
    while (this.char !== '"') {
      if (this.char === '\\') {
        this.nextChar(true);
        if (this.char !== '"') {
          repr += '\\' + this.char;
        }
      } else {
        repr += this.char;
      }
      this.nextChar(true);
    }

    this.nextChar();
    let flags = "";
    while (!this.char.match(CONTROL)) {
      flags += this.char;
      this.nextChar();
    }

    return new RegExp(repr, flags);
  }

  nextForm(): any {
    this.skipWhitespace();
    const meta = {
      line: this.line,
      column: this.column,
      filename: this.filename
    };

    switch (this.char) {
    case "(":
      return this._readList();
    case "{":
      return this._readMap();
    case '"':
      return this._readString();
    case "[":
      return this._readVector();
    case ";":
      while (this.char !== EOF && this.char !== '\n') {
        this.nextChar();
      }
      this.nextChar();
      return this.nextForm();
    case "'":
      this.nextChar(true);
      return d.list(d.symbol('vimes.core/quote'), this.nextForm());
    case "`":
      this.nextChar(true);
      return d.list(d.symbol('vimes.core/syntax-quote'), this.nextForm());
    case "~":
      this.nextChar(true);
      if (this.char === '@') {
        this.nextChar();
        return d.list(d.symbol('vimes.core/unquote-splicing'), this.nextForm());
      }
      return d.list(d.symbol('vimes.core/unquote'), this.nextForm());
    case "!":
      this.nextChar(true);
      return d.list(d.symbol('vimes.core/derivation'), this.nextForm());
    case "^":
      this.nextChar(true);
      let meta = this.nextForm();
      return d.list(d.symbol('vimes.core/with-meta'), this.nextForm(), meta);
    case "#":
      this.nextChar(true);
      switch (this.char) {
      case '"':
        return this._readRegExp();
      case '{':
        return this._readSet();
      case '(':
        return d.list(d.symbol('vimes.core/lambda*'), this._readList());
      case '=':
        this.nextChar(true);
        return d.list(d.symbol('vimes.core/read-eval'), this.nextForm());
      case '_':
        this.nextChar(true);
        this.nextForm();
        return this.nextForm();
      default:
        if (this.char.match(CONTROL)) {
          throw new Error('syntax error: ' + this.char);
        }
        const tag = this._readSymbol();
        return d.list(tag, this.nextForm());
      }
    case EOF:
      throw new Error('unexpected EOF');
    default:
      return this._readSymbol();
    }
  }
}

export function read(s: string) {
  return new LispReader(s, "no_file").nextForm();
}
