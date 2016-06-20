// import {core} from "./core";
import {read} from "./reader";
import {Ident} from "./data/Ident";
import {ident} from "./data"
import {Map} from "immutable";
import {Namespace, sanitize} from "./namespace";

export class LocalsStack {
  below: LocalsStack;
  ident2sanitized: Map<Ident, string>;
  sanitized2Ident: Map<string, Ident>;
  constructor(below: LocalsStack) {
    if (below != null) {
      this.ident2sanitized = below.ident2sanitized.asImmutable().asMutable();
      this.sanitized2Ident = below.sanitized2Ident.asImmutable().asMutable();
    } else {
      this.ident2sanitized = Map<Ident, string>().asMutable();
      this.sanitized2Ident = Map<string, Ident>().asMutable();
    }
    this.below = below;
  }

  setBinding(ident: Ident): string {
    const _sanitized = sanitize(ident.name);
    let sanitized = _sanitized;
    let i = 0;
    while (this.sanitized2Ident.get(sanitized) === ident) {
      sanitized = _sanitized + "_" + i;
    }
    this.ident2sanitized.set(ident, sanitized);
    this.sanitized2Ident.set(sanitized, ident);
    return sanitized;
  }
}

export class Env {
  binding: string;

  namespaces: {[key: string]: Namespace}
  ns: Namespace;
  locals: LocalsStack;

  constructor(binding: string) {
    this.binding = binding;
    this.namespaces = {};
    this.setNamespace(ident("user"));
    this.locals = new LocalsStack(null);
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

  pushLocals() {
    this.locals = new LocalsStack(this.locals);
  }

  popLocals() {
    this.locals = this.locals.below;
  }


}

export const ENV = new Env("__vimes_env__");
