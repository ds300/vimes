import {expect} from 'chai'
import {evaluate, compile} from '../src/compiler'
import {ENV} from '../src/env'
import * as d from '../src/data'
import * as s from '../src/specials';

function doeval(form) {
  return evaluate(ENV, compile(ENV, form));
}

describe('the compiler', () => {
  it('compiles primitives', () => {
    expect(compile(ENV, 4)[1]).to.eql('4');
    expect(compile(ENV, false)[1]).to.eql('false');
    expect(compile(ENV, true)[1]).to.eql('true');
    expect(compile(ENV, "blah")[1]).to.eql('"blah"');
  });
  it('compiles if expressions', () => {
    const five = d.list(s.IF, true, 5, 6);
    expect(doeval(five)).to.eql(5);
    expect(doeval(5)).to.eql(5);
  });
  it('compiles do sequences', () => {
    const five = d.list(s.IF, true, 5, 6);
    const stuff = d.list(s.DO, 4, five);
    console.log(compile(ENV, stuff));
  });
  it('interns values', () => {
    const five = d.list(s.DEF, d.ident('five'), 5);
    console.log(compile(ENV, five));
  });
  it('evals primitives', () => {
    const stuff = evaluate(ENV, [null, "__vimes_env__.read('4')"]);
    expect(stuff).to.eql(4);
  });
  it('compiles function calls', () => {
    const five = d.list(d.ident('five'), 5, true, false);
    console.log(compile(ENV, five));
  });
  it('compiles function literals', () => {
    const f = d.list(s.FN, d.vector(d.ident('a'), d.ident('b')), 4, null, 5, false);
    console.log(compile(ENV, f))
  });
});
