import { ProtocolFunction, implement } from '../src/protocols';
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
});
