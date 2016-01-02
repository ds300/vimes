import {Keyword} from './data/Keyword';
import {Ident} from './data/Ident';
import {ArraySeq} from './data/ArraySeq';
import {ArrayVector} from './data/ArrayVector';
import {ArrayMap} from './data/ArrayMap';
import {ArraySet} from './data/ArraySet';

const identStore = {};
const keywordStore = {};

function thing<T>(string: string, store: {[key: string]: any}, cons: (ns: string, name: string) => T) {
  const existing = store[string];
  if (existing) {
    return existing;
  } else {
    let parts = string.split('/');
    let ident = null;
    if (parts.length === 1) {
      ident = cons(null, string);
    } else if (parts.length === 2) {
      ident = cons(parts[0], parts[1]);
    } else {
      throw new Error('too many slashes in symbol')
    }
    store[string] = ident;
    return ident;
  }
}

export function ident(string) {
  return thing(string, identStore, (ns, name) => new Ident(ns, name));
}

export function keyword(string) {
  return thing(string, identStore, (ns, name) => new Keyword(ns, name));
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
