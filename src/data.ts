import {Keyword} from './data/Keyword';
import {Ident} from './data/Ident';
import {ArraySeq} from './data/ArraySeq';
import {ArrayVector} from './data/ArrayVector';
import {ArrayMap} from './data/ArrayMap';
import {ArraySet} from './data/ArraySet';


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

export function ident(string: string) {
  let parts = string.split('/');
  if (parts.length === 1) {
    return new Ident(null, string);
  } else if (parts.length === 2) {
    return new Ident(parts[0], parts[1]);
  } else {
    throw new Error('too many slashes in keyword')
  }
}

export function list(...items) {
  return new ArraySeq(items, 0);
}

export function vector<T>(...args: T[]): ArrayVector<T> {
  return new ArrayVector(args);
}

export function hashMap(...args: any[]): ArrayMap<any, any> {
  return new ArrayMap(args);
}

export function set<T>(...elems: T[]): ArraySet {
  return new ArraySet(elems);
}
