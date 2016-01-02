import {read} from "./reader";
import {Ident} from "./data/Ident";
import {ident} from "./data"
import {Map} from "immutable";
import {Namespace} from "./namespace";

export class Env {
  binding: string;

  namespaces: {[key: string]: Namespace}
  ns: Namespace;
  locals: Map<Ident, string>;

  constructor(binding: string) {
    this.binding = binding;
    this.namespaces = {};
    this.setNamespace(ident("user"));
    this.locals = Map<Ident, string>();
  }

  setNamespace(ident: Ident): void {
    if (!this.namespaces[ident.name]) {
      this.namespaces[ident.name] = new Namespace(ident.name);
    }
    this.ns = this.namespaces[ident.name];
  }

  read(code: string) {
    return read(code);
  }

  bool(val) {
    return val == null || val === false ? false : true;
  }
}

export const ENV = new Env("__vimes_env__");
