import { implement, ProtocolFunction } from './protocols'
import { is } from './is'

export const show = ProtocolFunction([1], null, 'vimes.core/show');
implement(show, Object.prototype, obj => obj.toString());
implement(show, null, (_) => 'nil');
implement(show, String.prototype, s => JSON.stringify(s));
const flags = r => r.flags || r.toString().match(/[gimuy]*$/)[0] || "";
implement(show, RegExp.prototype, r => `#"${r.source}"${flags(r)}`)

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
  export function toString(seq: Seq<any>, left?, right?, between?): string {
    left = left == null ? '(' : left;
    right = right == null ? ')' : right;
    between = between == null ? ' ' : between;
    if (seq.seq()) {
      let result = left + show(seq.first());
      seq = seq.rest();
      while (seq.seq()) {
        result += " " + show(seq.first());
        seq = seq.rest();
      }
      return result + right;
    } else {
      return left + right;
    }
  }
  export function equals(a: Seq<any>, b: Seq<any>) {
    while (a.seq() && b.seq()) {
      if (!is(a.first(), b.first())) {
        return false;
      }
      a = a.rest();
      b = b.rest();
    }
    return !(a.seq() || b.seq());
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
    } else {
      return ":" + this.name;
    }
  }
  equals(other) {
    return other instanceof Keyword && other.namespace === this.namespace && other.name === this.name;
  }
}

export function keyword(string: string) {
  let parts = string.split('/');
  if (parts.length === 1) {
    return new Keyword(null, string);
  } else if (parts.length === 2) {
    return new Keyword(parts[0], parts[1]);
  } else {
    throw new Error('too many slashes in keyword')
  }
}

export function symbol(string: string) {
  let parts = string.split('/');
  if (parts.length === 1) {
    return new Symbol(null, string);
  } else if (parts.length === 2) {
    return new Symbol(parts[0], parts[1]);
  } else {
    throw new Error('too many slashes in keyword')
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
      return this.namespace + "/" + this.name;
    } else {
      return this.name;
    }
  }
  equals(other) {
    return other instanceof Symbol && other.namespace === this.namespace && other.name === this.name;
  }
}

export class ArraySeq<T> implements Show, Seq<T> {
  array: T[]
  index: number;
  constructor(array: T[], index: number) {
    this.array = array;
    this.index = index;
  }

  first() {
    return this.array[this.index];
  }

  rest() {
    if (this.index >= this.array.length -1) {
      return <any>EMPTY_LIST;
    } else {
      return new ArraySeq(this.array, this.index + 1);
    }
  }

  seq() {
    return this.array.length === 0 ? null : this;
  }

  toString () {
    return Seq.toString(this);
  }

  equals(other) {
    return Seq.equals(this, other);
  }
}

export function list(...items) {
  return new ArraySeq(items, 0);
}

export class ArrayMap<K, V> {
  array: any[];
  constructor(array: any[]) {
    this.array = array;
  }

  get(k: K, nf?: V) {
    for (var i = 0; i < this.array.length; i+=2) {
      if (is(this.array[i], k)) {
        return this.array[i+1];
      } else {
        return nf;
      }
    }
  }

  assoc(k: K, v: V) {
    const array_copy = this.array.slice(0);
    for (var i = 0; i < array_copy.length; i+=2) {
      if (is(array_copy[i], k)) {
        array_copy[i+1] = v;
        return new ArrayMap(array_copy);
      }
    }
    array_copy.push(k, v);
    return new ArrayMap(array_copy);
  }

  toString(k: K, v: V) {
    if (this.array.length === 0) {
      return "{}";
    } else {
      let result = `{${show(this.array[0])} ${show(this.array[1])}`;

      for (let i = 2; i < this.array.length; i += 2) {
        result += `, ${show(this.array[i])} ${show(this.array[i+1])}`;
      }

      return result + "}";
    }
  }
  count() {
    return this.array.length / 2;
  }
  equals(other) {
    if (!(other instanceof ArrayMap) || other.count() !== this.count()) {
      return false;
    }

    for (let i = 0; i < this.array.length; i++) {
      if (!is(this.array[i+1], other.get(this.array[i]))) {
        return false;
      }
    }

    return true;
  }
}

export class ArrayVector<T> {
  array: any[];
  constructor(array) {
    this.array = array;
  }

  get(index: number, notFound?: T) {
    if (index < 0 || index  > this.array.length) {
      throw new Error('index out of bounds');
    }
    return this.array[index];
  }

  assoc(index: number, value: T) {
    let array_copy = this.array.slice(0);
    array_copy[index] = value;

    return new ArrayVector(array_copy);
  }

  seq() {
    return new ArraySeq(this.array, 0);
  }

  first() {
    return this.array[0];
  }

  rest() {
    return this.seq().rest();
  }

  toString() {
    return Seq.toString(this.seq(), '[', ']')
  }

  equals(other) {
    return Seq.equals(this, other);
  }
}

export class ArraySet {
  array: any[];
  constructor(array) {
    this.array = [];

    array.forEach(item => {
      for (let existing of this.array) {
        if (is(existing, item)) {
          return
        }
      }
      this.array.push(item);
    });
  }

  has(item) {
    for (let x of this.array) {
      if (is(x, item)) {
        return true;
      }
    }
    return false;
  }

  seq() {
    return new ArraySeq(this.array, 0);
  }

  toString() {
    return Seq.toString(this.seq(), "#{", "}");
  }

  count() {
    return this.array.length;
  }

  equals(other: any) {
    if (!(other instanceof ArraySet) || other.count() !== this.count()) {
      return false;
    }

    for (let item of this.array) {
      if (!other.has(item)) {
        return false;
      }
    }

    return true;
  }
}

export function vector<T>(...args: T[]): ArrayVector<T> {
  return new ArrayVector(args);
}

// number,
// regex
// string
// char
// map
// set
// vector
