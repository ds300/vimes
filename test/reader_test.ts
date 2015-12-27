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
  // it('reads maps', () => {
  //   throw new Error();
  // });
  // it('reads sets', () => {
  //   throw new Error();
  // });
});
