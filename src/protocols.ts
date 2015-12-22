declare interface Symbol {};
declare function Symbol(name?:string): symbol;

export const IS_PROTO_FN = Symbol("is protocol function");

export interface MultiArityFunction {
  arity2impl: Function[];
  vargsFrom: number;
  // implicitly the default impl
}

export interface ProtocolFunction {
  identity: symbol;
  nilImpl: Function;
  arities: boolean[];
}

function getTypeOf(x): string {
  switch (typeof x) {
    case 'object':
      return Object.prototype.toString.call(x);
    default:
      return typeof x;
  }
}

export function getProtoImpl(fn: ProtocolFunction, arg, except: boolean) {
  let impl;
  if (arg == null) {
    impl = fn.nilImpl;
  } else {
    impl = arg[fn.identity];
  }
  if (except && !impl) {
    throw new Error(`no implementation found for protocol function ${fn.identity.toString()} and type ${getTypeOf(arg)}`);
  }
  return impl;
}

export function getImpl(fn: MultiArityFunction, arity: number, except: boolean) {
  let impl = fn.arity2impl[arity];
  if (!impl) {
    if (fn.vargsFrom !== null && arity >= fn.vargsFrom) {
      impl = fn.arity2impl[fn.vargsFrom];
    } else if (except) {
      throw Error(`Arity exception: ${arity}`);
    }
  }
  return impl;
}

export function MultiArityFunction(arity2impl, vargsFrom: number, name: string): MultiArityFunction {
  const f = <any>function () {
    return getImpl(f, arguments.length, true).apply(null, arguments);
  };
  f.arity2impl = arity2impl;
  f.vargsFrom = vargsFrom;
  return f;
}

export function ProtocolFunction (arities: number[], vargsFrom: number, name?:string) : ProtocolFunction & Function {
  let f: any;

  switch (arities.length) {
  case 0:
    throw new Error('protocol functions must have at least one arity');
  case 1:
    switch (arities[0]) {
    case 0:
      throw new Error('protocol functions must have arity > 0');
    case 1:
      f = function (a) {
        return getProtoImpl(f, a, true)(a);
      };
      break;
    case 2:
      f = function (a, b) {
        return getProtoImpl(f, a, true)(a, b);
      };
      break;
    default:
      f = function (a) {
        return getProtoImpl(f, a, true).apply(null, arguments);
      };
    }
    break;
  default:
    f = function (a) {
      return getProtoImpl(f, a, true).apply(null, arguments);
    };
  }

  f.vargsFrom = vargsFrom;
  f.arities = arities;
  f.identity = Symbol(name || ":unnamed");
  f.nilImpl = null;
  f[IS_PROTO_FN] = true;

  return f;
}

export function implement(fn: ProtocolFunction, prototype, impl: any) {
  const identity = fn.identity;
  if (!identity) {
    throw new Error('not a protocol function');
  }
  if (prototype == null) {
    if (fn.nilImpl) throw new Error("cannot implement a protocol twice");
    fn.nilImpl = impl;
  } else {
    Object.defineProperty(
      prototype,
      <any>fn.identity,
      {enumerable: false, value: impl}
    );
  }
}
