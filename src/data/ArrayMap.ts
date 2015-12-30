import {is} from '../is';
import {show} from './proto';

export class ArrayMap<K, V> {
  array: any[];
  constructor(array: any[]) {
    this.array = array;
  }

  get(k: K, nf?: V) {
    for (var i = 0; i < this.array.length; i+=2) {
      if (is(this.array[i], k)) {
        return this.array[i+1];
      }
    }
    return nf;
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

    for (let i = 0; i < this.array.length; i+=2) {
      if (!is(this.array[i+1], other.get(this.array[i]))) {
        return false;
      }
    }

    return true;
  }
}
