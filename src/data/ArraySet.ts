import {is} from '../is'
import {ArraySeq} from './ArraySeq'
import {Seq} from './interfaces'

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
