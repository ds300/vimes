import {Map} from "immutable";
import {Ident} from "./data/Ident";
import * as s from './specials'

function sanitize (name: string): string {
  return name.replace(/\W/g, '_');
}

function sanitizeAndQualify(name, context) {
  const sanitized = sanitize(name);
  let qualified = sanitized;
  let i = 0;
  while (qualified in context) {
    qualified = sanitized + "_" + (i++);
  }
  return qualified;
}


export class Namespace {
  // varname to sanitized varname
  names: any;
  meta: any;
  module: any;

  // nsalias to nsproper
  aliased: any;
  // unqualified varname to fully qualified sanitized
  referred: any;
  // unqualified varname to unqualified sanitized
  referredUnsanitized: any;

  // mapping core varnames to true
  coreExclusions: any;

  // map from actual ns name to actual ns
  nsName2ns: any;
  // map from actual ns name to sanitized
  // e.g. vimes.core -> vimes_core
  nsName2contextName: any;
  // map from sanitized ns name to module object
  // used for eval purposes
  context: any;

  name: string;

  constructor (name: string, coreExclusions?: any) {
    this.name = name;
    this.names = {};
    this.module = {};
    this.meta = {};
    this.referred = {};
    this.referredUnsanitized = {};
    this.aliased = {};
    this.nsName2contextName = {};
    this.nsName2ns = {};
    this.context = {};
    this.coreExclusions = coreExclusions || {};

    this.addDependency(this);
  }

  addDependency(ns: Namespace) {
    this.nsName2ns[ns.name] = ns;
    let qualified = this.nsName2contextName[ns.name];
    if (qualified == null) {
      qualified = sanitizeAndQualify(ns.name, this.nsName2contextName);
      this.nsName2contextName[ns.name] = qualified;
    }
    this.context[qualified] = ns.module;
  }

  intern(name: Ident, value: any, meta?: Map<any, any>) {
    if (name.namespace) {
      throw new Error(`can't intern identifier with namespace`);
    }
    if (name.name in this.referred || (name.name in CORE.names && !(name.name in this.coreExclusions))) {
      if (name.name in this.referred) {
        console.warn(`'${name.name}' already refers to ${this.referredUnsanitized[name.name].toString()} in ${this.name}`);
      } else {
        console.warn(`'${name.name}' already refers to vimes.core/${name.name} in ${this.name}`);
      }
    }
    let qualified = this.names[name.name];
    if (qualified == null) {
      qualified = sanitizeAndQualify(name.name, this.module);
      this.names[name.name] = qualified;
    }
    this.module[qualified] = value;
    this.meta[name.name] = meta;
  }

  refer(to: Ident, as: Ident) {
    const resolved = this.resolve(to);
    this.referredUnsanitized[as.name] = to;
    this.referred[as.name] = resolved;
  }

  alias(ns: Ident, as: Ident) {
    if (ns.namespace || as.namespace) {
      throw new Error(`can't alias fully qualified idents`);
    }
    this.aliased[as.name] = ns.name;
  }

  isPublic(name: string) {
    if (this.names[name]) {
      let meta = this.meta[name];
      if (meta && !meta.get(s.K_PRIVATE)) {
        return false;
      }
      return true;
    } else {
      return false;
    }
  }

  // returns fully-qualified globally-valid identifier for given var name
  qualify(ident: Ident): Ident {
    if (ident.namespace != null) {
      // has a namespace so:
      //  check this ns, check aliases, check required
      if (ident.namespace === this.name) {
        if (this.names[ident.name]) {
          return ident;
        }
      } else {
        const aliased = this.alias[ident.namespace];
        if (aliased) {
          const ns = this.nsName2ns[aliased];
          if (ns != null && ns.isPublic(ident.name)) {
            return new Ident(aliased, ident.name);
          }
        } else {
          const ns = this.nsName2ns[ident.namespace];
          if (ns != null && ns.isPublic(ident.name)) {
            return ident;
          }
        }
      }
    } else {
      // no namespace, figure it out
      //   check local, check referred, check core
      const local = this.names[ident.name];
      if (local != null) {
        return new Ident(this.name, ident.name);
      } else {
        const referred = this.referredUnsanitized[ident.name];
        if (referred != null) {
          return referred;
        }
      }
      if (!this.coreExclusions[ident.name]) {
        if (CORE.isPublic(ident.name)) {
          return new Ident('vimes.core', ident.name);
        }
      }
    }
    throw new Error(`unable to resolve symbol ${ident.toString()}`);
  }

  // ident has defo been qualified
  resolve(ident: Ident): [string, string] {
    if (this.name === ident.namespace) {
      const sanitized = this.names[ident.name];
      if (sanitized != null) {
        return [this.nsName2contextName[this.name], sanitized];
      }
    } else {
      // ident from different ns
      const ns = ident.namespace === 'vimes.core'
                ? CORE
                : this.nsName2ns[ident.namespace];
      if (ns != null) {
        const name = ns.resolvePublic(ident);
        return [this.nsName2contextName[ident.namespace], name];
      }
    }
    throw new Error(`unable to resolve symbol ${ident.toString()}`);
  }

  resolvePublic(name: Ident): string {
    if (name.name in this.names) {
      const meta = this.meta[name.name];
      if (meta && !meta.get(s.K_PRIVATE)) {
        return this.names[name.name];
      }
    }
    throw new Error(`unable to resolve symbol ${name.toString()}`);
  }
}

export const CORE = new Namespace('vimes.core');
