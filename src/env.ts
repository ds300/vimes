import {core} from "./core";
import {read} from "./reader";
import {Ident} from "./data/Ident";
import {ident} from "./data"
import {Map} from "immutable";
import {Namespace} from "./namespace";

export class Env {
  binding: string;

  namespaces: {[key: string]: Namespace}
  ns: Namespace;
  locals: Map<string, string>;

  constructor(binding: string) {
    this.binding = binding;
    this.namespaces = {};
    this.setNamespace(ident("user"));
    this.locals = Map<Ident, string>();
  }

  loadNS(nsName: string): Namespace {
    let ns = this.namespaces[nsName];
    if (ns == null) {
      ns = new Namespace(nsName);
      this.namespaces[nsName] = ns;
    }
    return ns;
  }

  setNamespace(ident: Ident): void {
    const ns = this.loadNS(ident.name);
    this.ns = ns;
  }

  read(code: string) {
    return read(code);
  }

  bool(val) {
    return val == null || val === false ? false : true;
  }

  importNS(ident: Ident): void {
    const ns = this.loadNS(ident.name);
    this.ns.addDependency(ns);
  }

  // return a compiled-JS-compatible ident string
  resolve(ident: Ident): string {
    // look in local bindings first
    return this.ns.resolve(this.ns.qualify(ident)).join(".");
  }

  // return the qualified version of ident, e.g. seq -> vimes.core/seq
  qualify(ident: Ident): Ident {
    // look in local bindings first
    return this.ns.qualify(ident).intern();
  }

  setLocalBindings(map: Map<string, string>): Map<string, string> {
    const current = this.locals;
    this.locals = map;
    return current;
  }
}

export const ENV = new Env("__vimes_env__");
