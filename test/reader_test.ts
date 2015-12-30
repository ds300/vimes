import { read } from '../src/reader'
import * as d from '../src/data'

import { expect } from 'chai'

function is (item) {
  return function (other) {
    return other === item || other.equals(item);
  }
}

describe('readers', () => {
  it('read lists', () => {
    const e = d.list();
    expect(read('()')).to.satisfy(is(e));
    expect(read('(())')).to.satisfy(is(d.list(e)));
    expect(read('(() ())')).to.satisfy(is(d.list(e, e)));
    expect(read('(() () (() ()))'))
      .to.satisfy(is(d.list(e, e, d.list(e, e))));
  });
  it('ignores commas', () => {
    const e = d.list();
    expect(read('(,),')).to.satisfy(is(e));
    expect(read('(,,(),)')).to.satisfy(is(d.list(e)));
    expect(read(',,(() (,,),,,)')).to.satisfy(is(d.list(e, e)));
    expect(read(',(,,() () (() (),,,)),'))
      .to.satisfy(is(d.list(e, e, d.list(e, e))));
  });
  it('reads numbers', () => {
    expect(read('0')).to.equal(0);
    expect(read('100')).to.equal(100);
    expect(read('-100')).to.equal(-100);
    expect(read('1e2')).to.equal(100);
    expect(read('1E2')).to.equal(100);
    expect(read('1.4e2')).to.equal(140);
    expect(read('-1.4e2')).to.equal(-140);
    expect(read('1.4243')).to.equal(1.4243);
    expect(read('-1.4243')).to.equal(-1.4243);
    expect(read('NaN')).to.not.satisfy(isFinite);
    expect(read('Infinity')).to.not.satisfy(isFinite);
    expect(read('Infinity')).to.equal(Infinity);
    expect(read('+Infinity')).to.equal(Infinity);
    expect(read('-Infinity')).to.equal(-Infinity);
    expect(read('-Infinity')).to.not.satisfy(isFinite);
  });
  it('reads characters', () => {
    expect(read('\\\'')).to.equal("'");
    expect(read('\\e')).to.equal("e");
    expect(read('\\\\')).to.equal("\\");
    expect(read('\\newline')).to.equal("\n");
    expect(read('\\return')).to.equal("\r");
    expect(read('\\space')).to.equal(" ");
    expect(read('\\tab')).to.equal("\t");
    expect(read('\\formfeed')).to.equal("\f");
    expect(read('\\backspace')).to.equal("\b");
    expect(read('\\u0078')).to.equal('x');
    expect(read('\\o170')).to.equal('x');
  });
  it('reads booleans and nil', () => {
    expect(read('true')).to.equal(true);
    expect(read('false')).to.equal(false);
    expect(read('nil')).to.equal(null);
  });
  it('reads strings', () => {
    expect(read(`"blah"`)).to.equal('blah');
    expect(read(`"blah\\nblah"`)).to.equal('blah\nblah');
    expect(read(`"blah\\"blah\\\\"`)).to.equal('blah"blah\\');
    expect(read(`"\\u0078"`)).to.equal('x');
    expect(read(`""`)).to.equal('');
  });
  it('reads vectors', () => {
    expect(read(`[]`)).to.satisfy(is(d.vector()));
    expect(read(`[1, 2, 3]`)).to.satisfy(is(d.vector(1, 2, 3)));
    expect(read(`[[]]`)).to.satisfy(is(d.vector(d.vector())));
    expect(read(`[["nested" "yo"]]`))
      .to.satisfy(is(d.vector(d.vector("nested", "yo"))));
  });
  it('reads maps', () => {
    expect(read(`{}`)).to.satisfy(is(d.hashMap()));
    expect(read(`{"hey" true}`)).to.satisfy(is(d.hashMap("hey", true)));
    expect(read(`{5 6, 7 8}`)).to.satisfy(is(d.hashMap(5, 6, 7, 8)));
    expect(read(`{5 6, 7 8}`)).to.satisfy(is(d.hashMap(7, 8, 5, 6)));
  });
  it('reads sets', () => {
    expect(read(`#{}`)).to.satisfy(is(d.set()));
    expect(read(`#{1,2,3,4}`)).to.satisfy(is(d.set(4,3,1,2)));
    expect(read(`#{1,2,3,4,1,3,2}`)).to.satisfy(is(d.set(4,3,1,2)));
  });
  it('reads keywords', () => {
    expect(read(`:blah`)).to.satisfy(is(d.keyword('blah')));
    expect(read(`:blah.core/blah`)).to.satisfy(is(d.keyword('blah.core/blah')));
    expect(() => read(`:blah.core/blah/blah`)).to.throw();
  });
  it('reads symbols', () => {
    expect(read(`blah`)).to.satisfy(is(d.ident('blah')));
    expect(read(`blah.core/blah`)).to.satisfy(is(d.ident('blah.core/blah')));
    expect(() => read(`blah.core/blah/blah`)).to.throw();
  });
  it('reads regexps', () => {
    expect(read(`#"i am a regexp"`)).to.eql(/i am a regexp/);
    expect(read(`#"i am a regexp"gi`)).to.eql(/i am a regexp/gi);
    expect(read(`#"i am a regexp"gi`)).to.eql(/i am a regexp/ig);
    expect(read(`#"\\""gi`)).to.eql(/"/ig);
    expect(read(`#""`)).to.eql(new RegExp('', ''));
  });
  it('skips comments', () => {
    expect(read(`[0;blah\n1]`)).to.satisfy(is(d.vector(0,1)));
    expect(read(`[;blaaah000\n\n0;blah\n1]`)).to.satisfy(is(d.vector(0,1)));
    expect(() => read(`[0;bl(ah\n1)]`)).to.throw();
  });
  it('quotes things', () => {
    const quote = d.ident('vimes.core/quote');
    expect(read(`'things`)).to.satisfy(is(d.list(quote, d.ident('things'))));
    expect(read(`''things`))
      .to.satisfy(is(d.list(quote, d.list(quote, d.ident('things')))));
  });
  it('syntax-quotes things', () => {
    const quote = d.ident('vimes.core/syntax-quote');
    expect(read(`\`things`)).to.satisfy(is(d.list(quote, d.ident('things'))));
    expect(read(`\`\`things`))
      .to.satisfy(is(d.list(quote, d.list(quote, d.ident('things')))));
    expect(read(`\`()`)).to.satisfy(is(d.list(quote, d.list())));
  });
  it('unquotes things', () => {
    const uq = d.ident('vimes.core/unquote');
    expect(read(`~things`)).to.satisfy(is(d.list(uq, d.ident('things'))));
    expect(read(`~~things`))
      .to.satisfy(is(d.list(uq, d.list(uq, d.ident('things')))));
    expect(read(`~(things)`))
      .to.satisfy(is(d.list(uq, d.list(d.ident('things')))));
  });
  it('unquote-splices things', () => {
    const uq = d.ident('vimes.core/unquote-splicing');
    expect(read(`~@things`)).to.satisfy(is(d.list(uq, d.ident('things'))));
    expect(read(`~@~@things`))
      .to.satisfy(is(d.list(uq, d.list(uq, d.ident('things')))));
    expect(read(`~@(things)`))
      .to.satisfy(is(d.list(uq, d.list(d.ident('things')))));
  });
  it('makes things derivations', () => {
    const uq = d.ident('vimes.core/derivation');
    expect(read(`!things`)).to.satisfy(is(d.list(uq, d.ident('things'))));
    expect(read(`!!things`))
      .to.satisfy(is(d.list(uq, d.list(uq, d.ident('things')))));
    expect(read(`!(things)`))
      .to.satisfy(is(d.list(uq, d.list(d.ident('things')))));
  });
});
