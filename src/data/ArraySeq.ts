import {Seq, Counted, Nth} from './interfaces';
import {EMPTY_LIST} from './Cons'

export class ArraySeq<T> implements Seq<T>, Nth<T>, Counted {
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

  count() {
    return this.array.length - this.index;
  }

  nth(n: number) {
    return this.array[n+this.index];
  }

  toString () {
    return Seq.toString(this);
  }

  equals(other) {
    return Seq.equals(this, other);
  }
}
