import {show} from './proto'
import {is} from '../is'

export interface Seqable<T> {
  seq(): Seq<T>;
}

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
