import { implement, ProtocolFunction } from './protocols'

export const show = ProtocolFunction([1], null, 'vimes.core/show');
implement(show, Object.prototype, obj => obj.toString());
implement(show, null, (_) => 'nil');

export interface Show {
  toString(): string;
}

export const seq = ProtocolFunction([1], null, "vimes.core/seq");

export interface Seqable<T> {
  seq(): Seq<T>;
}

export const first = ProtocolFunction([1], null, "vimes.core/first");
export const rest = ProtocolFunction([1], null, "vimes.core/rest");

export interface Seq<T> extends Seqable<T> {
  first(): T;
  rest(): Seq<T>;
}

export module Seq {
  export function toString(seq: Seq<any>): string {
    if (seq.seq()) {
      let result = "(" + seq.first().toString();
      seq = seq.rest();
      while (seq.seq()) {
        result += ", " + seq.first().toString();
        seq = seq.rest();
      }
      return result;
    } else {
      return "()";
    }
  }
}

export class Cons<T> implements Seq<T>, Show {
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
  [first.identity]: () => null
});


export class Keyword implements Show {
  name: string;
  namespace: string;
  constructor (namespace: string, name: string) {
    this.namespace = namespace;
    this.name = name;
  }
  toString() {
    if (this.namespace) {
      return ":" + this.namespace + "/" + this.name;
    }
  }
}

export class Symbol implements Show {
  name: string;
  namespace: string;
  constructor (namespace: string, name: string) {
    this.namespace = namespace;
    this.name = name;
  }
  toString() {
    if (this.namespace) {
      return ":" + this.namespace + "/" + this.name;
    }
  }
}

// number,
// regex
// string
// char
// map
// set
// vector
