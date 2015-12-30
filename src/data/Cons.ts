import {Seq} from './interfaces';
import {implement} from '../protocols'
import {show, seq, first, rest} from './proto'

export class Cons<T> implements Seq<T> {
  head: T;
  tail: Seq<T>;
  constructor (head: T, tail: Seq<T>) {
    this.head = head;
    this.tail = tail;
  }

  first() {
    return this.head;
  }

  rest() {
    return this.tail;
  }

  seq() {
    return this;
  }

  toString() {
    return Seq.toString(this);
  }

  equals(other) {
    return Seq.equals(this, other);
  }
}

implement(show, Cons.prototype, Seq.toString);
implement(seq, Cons.prototype, x => x);
implement(first, Cons.prototype, x => x.first());
implement(rest, Cons.prototype, x => x.rest());

export function cons<T>(head: T, tail: Seq<T>): Cons<T> {
  return new Cons(head, tail);
}

export const EMPTY_LIST: Seq<any> = Object.freeze({
  seq: () => null,
  first: () => null,
  rest: () => EMPTY_LIST,
  toString: () => '()',
  [seq.identity]: () => null,
  [first.identity]: () => null,
  equals: (other) => other.seq() == null
});
