import {Map} from "immutable";
import {Ident} from "./data/Ident";
const global = {};

export class Namespace {
  module: any;
  meta: any;

  referred: any;
  aliased: any;

  name: string;

  constructor (name: string) {
    this.name = name;
    this.module = {};
    this.meta = {};
    this.referred = {};
    this.aliased = {};
  }

  intern(name: Ident, value: any, meta?: Map<any, any>) {
    this.module[name.name] = value;
    this.meta[name.name] = meta;
  }
}

export function load(ns: Ident) {
  if (!global[ns.name]) {
    global[ns.name] = new Namespace(ns.name);
  }
  return global[ns.name];
}
