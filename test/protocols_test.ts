import { ProtocolFunction, implement, MultiArityFunction } from '../src/protocols';
import { expect } from 'chai'

describe('protocols', () => {
  it('are functions', () => {
    expect(ProtocolFunction([1], null, "my-func"))
      .to.be.a('function');
  });
  it('can be invoked', () => {
    expect(() => {
      ProtocolFunction([1], null, "my-func")('blah');
    }).to.throw();
  });
  it('can be implemented for many types', () => {
    const reverse = ProtocolFunction([1], null, "reverse");
    expect(() => {
      reverse('blah');
    }).to.throw();
    implement(
      reverse,
      String.prototype,
      (s:string) => s.split('').reverse().join('')
    );

    expect(reverse('blah')).to.equal('halb');

    implement(
      reverse,
      Number.prototype,
      n => -n
    );

    expect(reverse(3)).to.equal(-3);
    expect(reverse(-3)).to.equal(3);
  });
  it('can be implemented for all objects', () => {
    const str = ProtocolFunction([1], null, "str");
    implement(str, Object.prototype, o => o.toString());

    expect(str({})).to.equal('[object Object]');
    expect(str([])).to.equal('');
    expect(str(5)).to.equal('5');

    implement(str, Array.prototype, a => 'i am an array!');

    expect(str([])).to.equal('i am an array!');
  });
  it('can be implemented for nil', () => {
    const str = ProtocolFunction([1], null, "str");
    implement(str, Object.prototype, o => o.toString());

    expect(() => str(null)).to.throw();
    expect(() => str(void 0)).to.throw();

    implement(str, null, _ => 'nil');

    expect(str(null)).to.equal('nil');
    expect(str(void 0)).to.equal('nil');

    expect(str({})).to.equal('[object Object]');
  });
  it('cannot be implemented for the same type twice', () => {
    const str = ProtocolFunction([1], null, "str");
    implement(str, Object.prototype, o => o.toString());

    expect(() => implement(str, Object.prototype, o => o.toString())).to.throw()

    implement(str, null, o => o.toString());
    expect(() => implement(str, null, o => o.toString())).to.throw()
  });
  it('can have multiple arities', () => {
    const numArgs = ProtocolFunction([1,2,3,4], 4, 'num-args');

    implement(
      numArgs,
      Object.prototype,
      MultiArityFunction(
        [ null
        , () => 1
        , () => 2
        , () => 3
        , () => `>=4`
        , () => 5
        ],
        4,
        "num-args:Object"
      )
    );

    expect(() => numArgs()).to.throw();
    expect(numArgs(1)).to.equal(1);
    expect(numArgs('a')).to.equal(1);
    expect(numArgs('a', 'b')).to.equal(2);
    expect(numArgs('a', 'b', 3)).to.equal(3);
    expect(numArgs('a', 'b', 3, 5)).to.equal('>=4');
    expect(numArgs('a', 'b', 3, 5, 4)).to.equal(5);
    expect(numArgs('a', 'b', 3, 5, 4, 6)).to.equal('>=4');
  });
});
