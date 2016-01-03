import {Keyword} from './data/Keyword';
import {Ident} from './data/Ident';
import {ArraySeq} from './data/ArraySeq';
import {ArrayVector} from './data/ArrayVector';
import {ArrayMap} from './data/ArrayMap';
import {ArraySet} from './data/ArraySet';


function split<T>(string: string) {
  let parts = string.split('/');
  let ident = null;
  if (parts.length === 1) {
    return [null, string];
  } else if (parts.length === 2) {
    return parts;
  } else {
    throw new Error('too many slashes in symbol')
  }
}

export function ident(string): Ident {
  const [ns, name] = split(string);
  return new Ident(ns, name);
}

export function keyword(string): Keyword {
  const [ns, name] = split(string);
  return new Keyword(ns, name);
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
