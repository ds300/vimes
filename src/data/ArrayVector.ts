import {Seq} from './interfaces'
import {ArraySeq} from './ArraySeq'

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
